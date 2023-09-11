import { type Model } from "mongoose"
import { type EventHandler } from "h3"
import { Entity } from "~/layers/mongo/types/entity"

export const useEntityListHandler = function<E extends Entity = Entity> (model: Model<E>): EventHandler {
  return async function (event) {
    const docs = await model.find()
    return docs.map(doc => doc.toJSON())
  }
}

export const useEntityReadHandler = function<E extends Entity = Entity> (model: Model<E>): EventHandler {
  return async function (event) {
    const { id } = getRouterParams(event)
    const doc = await model.findById(id)
    return doc?.toJSON()
  }
}

export const useEntityCreateHandler = function<E extends Entity = Entity> (model: Model<E>): EventHandler {
  return async function (event) {
    const body = await readBody<Partial<E>>(event)
    const { _id: id } = await model.create(body)
    const doc = await model.findById(id)
    return doc?.toJSON()
  }
}

export const useEntityUpdateHandler = function<E extends Entity = Entity> (model: Model<E>): EventHandler {
  return async function (event) {
    const { id } = getRouterParams(event)
    const body = await readBody<Partial<E>>(event)
    await model.updateOne({ _id: id }, body)
    const doc = await model.findById(id)
    return doc?.toJSON()
  }
}

export const useEntityDeleteHandler = function<E extends Entity = Entity> (model: Model<E>): EventHandler {
  return async function (event) {
    const { id } = getRouterParams(event)
    await model.deleteOne({ _id: id })
    return null
  }
}
