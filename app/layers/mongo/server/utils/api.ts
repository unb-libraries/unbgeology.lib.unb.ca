import { type Model, type Schema, type Types } from "mongoose"
import { type EventHandler, type H3Event } from "h3"
import { Entity, EntityFieldTypes } from "~/layers/mongo/types/entity"

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

const entityURLtoID = async function (url: string, modelName: string) {
  const model = useEntityType(modelName)
  const { _id }: { _id: Types.ObjectId } = await model.findByUrl(url)
  return _id
}

const resolveEntityURLs = async function<E extends Entity> (obj: Partial<E>, schema: Schema<E>) {
  const entries = await Promise.all(Object.entries(obj)
    .filter(([pathName, _]) => schema.path(pathName).instance === `ObjectId`)
    .map(async ([pathName, url]) => {
      const pathSchema = schema.path(pathName)
      const { ref } = pathSchema.options
      return [pathName, await entityURLtoID(url, ref)]
    }))

  return {
    ...obj,
    ...Object.fromEntries(entries),
  }
}

interface EntityHandlerOptions<E extends Entity> {
  discriminatorKey?: string
}

interface EntityDeleteHandlerOptions<E extends Entity> extends EntityHandlerOptions<E> {
  findAndDelete?: (event: H3Event, model: Model<E>) => Promise<string[]>
}

interface EntityRelationshipHandlerOptions<E extends Entity> extends EntityHandlerOptions<E> {
  rel: string
}

export const useEntityCollectionHandler = function<E extends Entity = Entity> (model: Model<E>, options?: EntityHandlerOptions<E>): EventHandler {
  return async function (event) {
    const { method } = event
    switch (method) {
      case `GET`: return await useEntityListHandler(model, options)(event)
      case `POST`: return await useEntityCreateHandler(model, options)(event)
    }
  }
}

export const useEntityHandler = function<E extends Entity = Entity> (model: Model<E>, options?: EntityHandlerOptions<E>): EventHandler {
  return async function (event) {
    const { method } = event
    switch (method) {
      case `GET`: return await useEntityReadHandler(model, options)(event)
      case `PUT`: return await useEntityUpdateHandler(model, options)(event)
      case `DELETE`: return await useEntityDeleteHandler(model, options)(event)
    }
  }
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
    const body = await resolveEntityURLs(await readBody<Partial<E>>(event), model.schema)
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
    const body = await resolveEntityURLs(await readBody<Partial<E>>(event), model.schema)
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

export const useEntityReferenceCollectionHandler = function<E extends Entity = Entity> (model: Model<E>, options: EntityRelationshipHandlerOptions<E>): EventHandler {
  return async function (event) {
    const { id, [options.rel]: path } = getRouterParams(event)

    const doc = await model
      .findById(id)
      .populate(path, `_id`)
      .select(path)

    return doc?.toJSON()[path]
  }
}

export const useEntityReferenceCollectionAddHandler = function<E extends Entity = Entity> (model: Model<E>, options: EntityRelationshipHandlerOptions<E>): EventHandler {
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
      .findByIdAndUpdate(id, { $addToSet: { [path]: { $each: entityIDs } } }, { returnDocument: `after` })
      .populate(path, `_id`)
      .select(path)

    return doc?.toJSON()[path]
  }
}
