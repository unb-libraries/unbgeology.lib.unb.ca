import { type Model } from "mongoose"
import { type EventHandler, type H3Event } from "h3"
import { Entity } from "~/layers/mongo/types/entity"

const getDiscriminator = function<E extends Entity> (event: H3Event, model: Model<E>, discriminator: string) {
  const type = getRouterParam(event, discriminator)
  if (type && model.discriminators?.[type]) {
    return model.discriminators?.[type]
  }
  return model
}

interface EntityHandlerOptions<E extends Entity> {
  discriminatorKey?: string
}

export const useEntityListHandler = function<E extends Entity = Entity> (model: Model<E>, options?: EntityHandlerOptions<E>): EventHandler {
  return async function (event) {
    if (options?.discriminatorKey) {
      model = getDiscriminator(event, model, options.discriminatorKey)
    }
    const docs = await model.find()
    return docs.map(doc => doc.toJSON())
  }
}

export const useEntityReadHandler = function<E extends Entity = Entity> (model: Model<E>, options?: EntityHandlerOptions<E>): EventHandler {
  return async function (event) {
    const { id } = getRouterParams(event)
    if (options?.discriminatorKey) {
      model = getDiscriminator(event, model, options.discriminatorKey)
    }
    const doc = await model.findById(id)
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
    const doc = await model.findById(id)
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
    const doc = await model.findById(id)
    return doc?.toJSON()
  }
}

export const useEntityDeleteHandler = function<E extends Entity = Entity> (model: Model<E>, options?: EntityHandlerOptions<E>): EventHandler {
  return async function (event) {
    const { id } = getRouterParams(event)
    if (options?.discriminatorKey) {
      model = getDiscriminator(event, model, options.discriminatorKey)
    }
    await model.deleteOne({ _id: id })
    return null
  }
}
