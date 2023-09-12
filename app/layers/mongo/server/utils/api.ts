import { type Model } from "mongoose"
import { type EventHandler, type H3Event } from "h3"
import { Entity } from "~/layers/mongo/types/entity"

const getDiscriminator = function<E extends Entity> (event: H3Event, model: Model<E>, discriminatorParam: string) {
  const type = getRouterParam(event, discriminatorParam)
  if (!type || !model.discriminators) {
    return model
  }

  const discriminator = Object
    .values(model.discriminators)
    .find(dsc => dsc.modelName.toLowerCase() === type)

  return discriminator || model
}

const findReferences = function<E extends Entity> (model: Model<E>) {
  return Object
    .values(model.schema.paths)
    .filter(({ path, instance, options }) => path !== `_id` && instance === `ObjectId` && options.ref)
    .map(({ path }) => path)
}

interface EntityHandlerOptions<E extends Entity> {
  discriminatorKey?: string
}

interface EntityDeleteHandlerOptions<E extends Entity> extends EntityHandlerOptions<E> {
  findAndDelete?: (event: H3Event, model: Model<E>) => Promise<string[]>
}

export const useEntityListHandler = function<E extends Entity = Entity> (model: Model<E>, options?: EntityHandlerOptions<E>): EventHandler {
  return async function (event) {
    if (options?.discriminatorKey) {
      model = getDiscriminator(event, model, options.discriminatorKey)
    }
    
    const query = model.find()
    findReferences(model).forEach(path => query.populate(path, `_id`))
    const docs = await query.exec()

    return docs.map(doc => doc.toJSON())
  }
}

export const useEntityReadHandler = function<E extends Entity = Entity> (model: Model<E>, options?: EntityHandlerOptions<E>): EventHandler {
  return async function (event) {
    const { id } = getRouterParams(event)
    if (options?.discriminatorKey) {
      model = getDiscriminator(event, model, options.discriminatorKey)
    }
    
    const query = model.findById(id)
    findReferences(model).forEach(path => query.populate(path, `_id`))
    const doc = await query.exec()

    return doc?.toJSON()
  }
}

export const useEntityCreateHandler = function<E extends Entity = Entity> (model: Model<E>, options?: EntityHandlerOptions<E>): EventHandler {
  return async function (event) {
    const body = await readBody<Partial<E>>(event)
    if (options?.discriminatorKey) {
      model = getDiscriminator(event, model, options.discriminatorKey)
    }
    
    const { _id: id } = await model.create(body)
    const query = model.findById(id)
    findReferences(model).forEach(path => query.populate(path, `_id`))
    const doc = await query.exec()
    
    return doc?.toJSON()
  }
}

export const useEntityUpdateHandler = function<E extends Entity = Entity> (model: Model<E>, options?: EntityHandlerOptions<E>): EventHandler {
  return async function (event) {
    const { id } = getRouterParams(event)
    const body = await readBody<Partial<E>>(event)
    if (options?.discriminatorKey) {
      model = getDiscriminator(event, model, options.discriminatorKey)
    }
    
    await model.updateOne({ _id: id }, body)
    const query = model.findById(id)
    findReferences(model).forEach(path => query.populate(path, `_id`))
    const doc = await query.exec()
    
    return doc?.toJSON()
  }
}

export const useEntityDeleteHandler = function<E extends Entity = Entity> (model: Model<E>, options?: EntityDeleteHandlerOptions<E>): EventHandler {
  return async function (event) {
    const { id } = getRouterParams(event)
    if (options?.discriminatorKey) {
      model = getDiscriminator(event, model, options.discriminatorKey)
    }

    if (options?.findAndDelete) {
      const ids = await options.findAndDelete(event, model)
      await model.deleteMany({ _id: { $in: ids } })
    } else {
    await model.deleteOne({ _id: id })
    }
    return null
  }
}
