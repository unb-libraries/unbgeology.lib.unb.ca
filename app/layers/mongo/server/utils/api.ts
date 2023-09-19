import { type Schema, type Types } from "mongoose"
import { type EventHandler, type H3Event } from "h3"
import { Entity, EntityModel, EntityFieldTypes, Cardinality, EntityInstanceMethods } from "~/layers/mongo/types/entity"

const getDiscriminator = function<E extends Entity = Entity, I extends EntityInstanceMethods = EntityInstanceMethods, M extends EntityModel<E, I> = EntityModel<E, I>> (event: H3Event, model: M, discriminatorParam: string) {
  const type = getRouterParam(event, discriminatorParam)
  if (!type || !model.discriminators) {
    return model
  }

  const discriminator = Object
    .values(model.discriminators as { [name: string]: M})
    .find(dsc => dsc.modelName.toLowerCase() === type)

  return discriminator || model
}

const findReferences = function<E extends Entity, I extends EntityInstanceMethods = EntityInstanceMethods> (model: EntityModel<E, I>) {
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

const resolveEntityURLs = function<E extends Entity = Entity, I extends EntityInstanceMethods = EntityInstanceMethods, M extends EntityModel<E, I> = EntityModel<E, I>> (obj: Record<string, keyof E>, model: M) {
  model.relationships({ filter: { cardinality: Cardinality.ONE_TO_MANY }})
    .filter(rel => rel.path in obj)
    .forEach((rel) => {
      obj[rel.path] = model.parseURL(obj[rel.path] as string) as keyof E
    })
  return obj
}

interface EntityHandlerOptions {
  discriminatorKey?: string
  rel?: string
}

interface EntityDeleteHandlerOptions extends EntityHandlerOptions {
  findAndDelete?: <E extends Entity, I extends EntityInstanceMethods = EntityInstanceMethods, M extends EntityModel<E, I> = EntityModel<E, I>> (event: H3Event, model: M) => Promise<string[]>
}

interface EntityRelationshipHandlerOptions extends EntityHandlerOptions {
  rel: string
}

export const useEntityCollectionHandler = function<E extends Entity = Entity, I extends EntityInstanceMethods = EntityInstanceMethods, M extends EntityModel<E, I> = EntityModel<E, I>> (model: M, options?: EntityHandlerOptions): EventHandler {
  return async function (event) {
    const { method } = event
    switch (method) {
      case `GET`: return await useEntityListHandler<E, I, M>(model, options)(event)
      case `POST`: return await useEntityCreateHandler<E, I, M>(model, options)(event)
    }
  }
}

export const useEntityHandler = function<E extends Entity = Entity, I extends EntityInstanceMethods = EntityInstanceMethods, M extends EntityModel<E, I> = EntityModel<E, I>> (model: M, options?: EntityHandlerOptions): EventHandler {
  return async function (event) {
    const { method } = event
    switch (method) {
      case `GET`: return await useEntityReadHandler(model, options)(event)
      case `PUT`: return await useEntityUpdateHandler(model, options)(event)
      case `DELETE`: return await useEntityDeleteHandler(model, options)(event)
    }
  }
}

export const useEntityListHandler = function<E extends Entity = Entity, I extends EntityInstanceMethods = EntityInstanceMethods, M extends EntityModel<E, I> = EntityModel<E, I>> (model: M, options?: EntityHandlerOptions): EventHandler {
  return async function (event) {
    const { id } = getRouterParams(event)
    if (options?.discriminatorKey) {
      model = getDiscriminator<E, I, M>(event, model, options.discriminatorKey)
    }

    const query = model.find()
    model.relationships({ filter: { cardinality: Cardinality.MANY_TO_ONE }})
      .forEach(rel => query.populate(rel.path, `_id`))
    const docs = await query.exec()

    return docs.map(doc => doc.toJSON())
  }
}

export const useEntityReadHandler = function<E extends Entity = Entity, I extends EntityInstanceMethods = EntityInstanceMethods, M extends EntityModel<E, I> = EntityModel<E, I>> (model: M, options?: EntityHandlerOptions): EventHandler {
  return async function (event) {
    const { id } = getRouterParams(event)
    if (options?.discriminatorKey) {
      model = getDiscriminator<E, I, M>(event, model, options.discriminatorKey)
    }

    const query = model.findById(id)
    findReferences(model).forEach(path => query.populate(path, `_id`))
    const doc = await query.exec()

    return doc?.toJSON()
  }
}

export const useEntityCreateHandler = function<E extends Entity = Entity, I extends EntityInstanceMethods = EntityInstanceMethods, M extends EntityModel<E, I> = EntityModel<E, I>> (model: M, options?: EntityHandlerOptions): EventHandler {
  return async function (event) {
    const body = await resolveEntityURLs<E, I, M>(await readBody(event), model)
    if (options?.discriminatorKey) {
      model = getDiscriminator<E, I, M>(event, model, options.discriminatorKey)
    }

    const { _id: id } = await model.create(body)
    const query = model.findById(id)
    findReferences(model).forEach(path => query.populate(path, `_id`))
    const doc = await query.exec()

    return doc?.toJSON()
  }
}

export const useEntityUpdateHandler = function<E extends Entity = Entity, I extends EntityInstanceMethods = EntityInstanceMethods, M extends EntityModel<E, I> = EntityModel<E, I>> (model: M, options?: EntityHandlerOptions): EventHandler {
  return async function (event) {
    const { id } = getRouterParams(event)
    const body = await resolveEntityURLs<E, I, M>(await readBody(event), model)
    if (options?.discriminatorKey) {
      model = getDiscriminator<E, I, M>(event, model, options.discriminatorKey)
    }

    await model.updateOne({ _id: id }, body)
    const query = model.findById(id)
    findReferences(model).forEach(path => query.populate(path, `_id`))
    const doc = await query.exec()

    return doc?.toJSON()
  }
}

export const useEntityDeleteHandler = function<E extends Entity = Entity, I extends EntityInstanceMethods = EntityInstanceMethods, M extends EntityModel<E, I> = EntityModel<E, I>> (model: M, options?: EntityDeleteHandlerOptions): EventHandler {
  return async function (event) {
    const { id } = getRouterParams(event)
    if (options?.discriminatorKey) {
      model = getDiscriminator<E, I, M>(event, model, options.discriminatorKey)
    }

    if (options?.findAndDelete) {
      const ids = await options.findAndDelete<E, I, M>(event, model)
      await model.deleteMany({ _id: { $in: ids } })
    } else {
      await model.deleteOne({ _id: id })
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
