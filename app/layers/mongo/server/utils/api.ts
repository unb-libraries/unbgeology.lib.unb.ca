import { type Types } from "mongoose"
import { type EventHandler, type H3Event } from "h3"
import {
  type Entity,
  type EntityModel,
  EntityFieldTypes,
  Cardinality,
  type EntityHandlerOptions,
  type EntityDeleteHandlerOptions,
  type EntityRelationshipHandlerOptions,
} from "~/layers/mongo/types/entity"

const getDiscriminator = function<E extends Entity = Entity> (event: H3Event, model: EntityModel, discriminatorParam: string) {
  const type = getRouterParam(event, discriminatorParam)
  if (!type || !model.discriminators) {
    return model
  }

  const discriminator = Object
    .values(model.discriminators as { [name: string]: typeof model})
    .find(dsc => dsc.modelName.toLowerCase() === type)

  return discriminator || model
}

const findReferences = function<E extends Entity> (model: EntityModel) {
  return Object
    .values(model.schema.paths)
    .filter(({ path, instance, options }) => path !== `_id` && instance === `ObjectId` && options.ref)
    .map(({ path }) => path)
}

const entityURLtoID = async function (url: string, modelName: string) {
  const model = useEntityType(modelName)
  const { _id }: { _id: Types.ObjectId } = await model.findByURL(url)
  return _id
}

const resolveEntityURLs = async function<E extends Entity = Entity> (obj: Record<string, keyof E>, model: EntityModel) {
  const relationships = model
    .relationships({ flatten: true })
    .filter(rel => rel.path in obj)

  for (const i in relationships) {
    const rel = relationships[i]
    const targetModel = useEntityType(rel.targetModelName || model.modelName)
    const doc = await targetModel.findByURL(obj[rel.path] as string)
    obj[rel.path] = doc?.id
  }
  return obj
}

export const useEntityHandler = function<E extends Entity = Entity> (model: EntityModel, options?: EntityHandlerOptions): EventHandler {
  return async function (event) {
    const { method } = event
    const { id } = getRouterParams(event)
    
    switch (method) {
      case `POST`: {
        if (!id) {
          return await useEntityCreateHandler<E>(model, options)(event)
    }
        throw createError({})
      }
      case `GET`: {
        if (id) {
          return await useEntityReadHandler<E>(model, options)(event)
        }
        return await useEntityListHandler<E>(model, options)(event)
      }
      case `PUT`: {
        return await useEntityUpdateHandler<E>(model, options)(event)
      }
      case `DELETE`: {
        return await useEntityDeleteHandler<E>(model, options)(event)
      }
    }
  }
}

export const useEntityListHandler = function<E extends Entity = Entity> (model: EntityModel, options?: EntityHandlerOptions): EventHandler {
  return async function (event) {
    if (options?.discriminatorKey) {
      model = getDiscriminator<E>(event, model, options.discriminatorKey)
    }

    const query = model.find()
    model.relationships({ filter: { cardinality: Cardinality.MANY_TO_ONE }, nested: false })
      .forEach((rel) => {
        const pk = useEntityType(rel.targetModelName as string).pk()
        query.populate(rel.path, pk !== `_id` ? `${pk} -_id` : `_id`)
      })
    const docs = await query.exec()

    return docs.map(doc => doc.toJSON())
  }
}

export const useEntityReadHandler = function<E extends Entity = Entity> (model: EntityModel, options?: EntityHandlerOptions): EventHandler {
  return async function (event) {
    const { id } = getRouterParams(event)
    if (options?.discriminatorKey) {
      model = getDiscriminator<E>(event, model, options.discriminatorKey)
    }

    const query = model.findByPK(id)
    model.relationships({ filter: { cardinality: Cardinality.MANY_TO_ONE }, nested: false })
      .forEach((rel) => {
        const pk = useEntityType(rel.targetModelName as string).pk()
        query.populate(rel.path, pk !== `_id` ? `${pk} -_id` : `_id`)
      })
    const doc = await query.exec()

    return doc?.toJSON()
  }
}

export const useEntityCreateHandler = function<E extends Entity = Entity> (model: EntityModel, options?: EntityHandlerOptions): EventHandler {
  return async function (event) {
    const body = await resolveEntityURLs<E>(await readBody(event), model)
    if (options?.discriminatorKey) {
      model = getDiscriminator<E>(event, model, options.discriminatorKey)
    }

    const { _id: id } = await model.create(body)
    const query = model.findById(id)
    model.relationships({ filter: { cardinality: Cardinality.MANY_TO_ONE }, nested: false })
      .forEach((rel) => {
        const pk = useEntityType(rel.targetModelName as string).pk()
        query.populate(rel.path, pk !== `_id` ? `${pk} -_id` : `_id`)
      })
    const doc = await query.exec()

    return doc?.toJSON()
  }
}

export const useEntityUpdateHandler = function<E extends Entity = Entity> (model: EntityModel, options?: EntityHandlerOptions): EventHandler {
  return async function (event) {
    const { id: pk } = getRouterParams(event)
    const body = await resolveEntityURLs<E>(await readBody(event), model)

    if (options?.discriminatorKey) {
      model = getDiscriminator<E>(event, model, options.discriminatorKey)
    }

    const doc = await model.findByPK(pk)
    await model.updateOne({ _id: doc._id }, body)
    return $fetch(doc.url())
  }
}

export const useEntityDeleteHandler = function<E extends Entity = Entity> (model: EntityModel, options?: EntityDeleteHandlerOptions): EventHandler {
  return async function (event) {
    const { id: pk } = getRouterParams(event)
    if (options?.discriminatorKey) {
      model = getDiscriminator<E>(event, model, options.discriminatorKey)
    }

    if (options?.findAndDelete) {
      const ids = await options.findAndDelete(event, model)
      await model.deleteMany({ _id: { $in: ids } })
    } else {
      const doc = await model.findByPK(pk)
      await model.deleteOne({ _id: doc._id })
    }
    return null
  }
}

export const useEntityReferenceCollectionHandler = function<E extends Entity = Entity, I extends EntityInstanceMethods = EntityInstanceMethods, M extends EntityModel<E, I> = EntityModel<E, I>> (model: M, options: EntityRelationshipHandlerOptions): EventHandler {
  return async function (event) {
    const { id, [options.rel]: path } = getRouterParams(event)

    const query = model.findById(id)
    query.populate(path, `_id`)
      .select(path)
    const doc = await query.exec()

    return doc?.toJSON()
  }
}

export const useEntityReferenceCollectionAddHandler = function<E extends Entity = Entity, I extends EntityInstanceMethods = EntityInstanceMethods, M extends EntityModel<E, I> = EntityModel<E, I>> (model: M, options: EntityRelationshipHandlerOptions): EventHandler {
  return async function (event) {
    const { id, [options.rel]: path } = getRouterParams(event)
    const body = await readBody(event)
    const schemaPath = model.schema.path(path)

    if (!(schemaPath instanceof EntityFieldTypes.Array)) {
      throw createError({ statusCode: 400, statusMessage: `Invalid path.` })
    }

    const targetModelName = schemaPath.caster?.options.ref
    const entityURLs = Array.isArray(body[path]) ? body[path] : [body[path]]
    const entityIDs: Types.ObjectId[] = await Promise.all(
      entityURLs.map(async (url: string) => await entityURLtoID(url, targetModelName)))

    const query = model.findByIdAndUpdate(id, { $addToSet: { [path]: { $each: entityIDs } } }, { returnDocument: `after` })
    query
      .populate(path, `_id`)
      .select(path)
    const doc = await query.exec()

    return doc?.toJSON()[path]
  }
}

export const useEntityReferenceCollectionRemoveHandler = function<E extends Entity = Entity, I extends EntityInstanceMethods = EntityInstanceMethods, M extends EntityModel<E, I> = EntityModel<E, I>> (model: M, options: EntityRelationshipHandlerOptions): EventHandler {
  return async function (event) {
    const { id, [options.rel]: path } = getRouterParams(event)
    const body = await readBody(event)
    const schemaPath = model.schema.path(path)

    if (!(schemaPath instanceof EntityFieldTypes.Array)) {
      throw createError({ statusCode: 400, statusMessage: `Invalid path.` })
    }

    const targetModelName = schemaPath.caster?.options.ref
    const entityURLs = Array.isArray(body[path]) ? body[path] : [body[path]]
    const entityIDs: Types.ObjectId[] = await Promise.all(
      entityURLs.map(async (url: string) => await entityURLtoID(url, targetModelName)))

    const doc = await model
      .findByIdAndUpdate(id, { $pull: { [path]: { $in: entityIDs } } }, { returnDocument: `after` })
      .populate(path, `_id`)
      .select(path)

    return doc?.toJSON()[path]
  }
}
