import { type EventHandler, type H3Event } from "h3"
import { type PopulateOptions } from "mongoose"
import {
  type Entity,
  type EntityModel,
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

export const useEntityRelationshipListHandler = function<E extends Entity = Entity> (model: EntityModel, options: EntityRelationshipHandlerOptions): EventHandler {
  return async function (event) {
    const { id: pk } = getRouterParams(event)

    if (options?.discriminatorKey) {
      model = getDiscriminator<E>(event, model, options.discriminatorKey)
    }

    const query = model.findByPK(pk)
    query.populate(options.rel)
    const rel = model.getRelationship(options?.rel)
    if (rel) {
      const populate: PopulateOptions = { path: rel.path, populate: [] }
      if (rel.targetModelName) {
        (populate.populate! as PopulateOptions[]).push(...useEntityType(rel.targetModelName)
          .relationships({ filter: { cardinality: Cardinality.MANY_TO_ONE } })
          .map(tmr => ({ path: tmr.path, select: `_id` })))
      }
      query.populate(populate)
    }
    const doc = await query.exec()
    return doc?.get(options.rel)
  }
}

export const useEntityRelationshipAddHandler = function<E extends Entity = Entity> (model: EntityModel, options: EntityRelationshipHandlerOptions): EventHandler {
  return async function (event) {
    const { id: pk } = getRouterParams(event)
    const body = Object.values(await resolveEntityURLs<E>(await readBody(event), model))[0]

    if (options?.discriminatorKey) {
      model = getDiscriminator<E>(event, model, options.discriminatorKey)
    }

    const doc = await model.findByPK(pk)
    await model.updateOne({ _id: doc._id }, { $addToSet: { [options.rel]: body } })
    return $fetch(doc.url(options.rel))
  }
}

export const useEntityRelationshipDeleteHandler = function<E extends Entity = Entity> (model: EntityModel, options: EntityRelationshipHandlerOptions) : EventHandler {
  return async function (event) {
    const { id: pk } = getRouterParams(event)
    const body = Object.values(await resolveEntityURLs<E>(await readBody(event), model))[0]

    if (options?.discriminatorKey) {
      model = getDiscriminator<E>(event, model, options.discriminatorKey)
    }

    const doc = await model.findByPK(pk)
    await model.updateOne({ _id: doc._id }, { $pull: { [options.rel]: body } })
    return $fetch(doc.url(options.rel))
  }
}
