import { type EventHandler, type H3Event } from "h3"
import { type PopulateOptions, type Document, type Types } from "mongoose"
import { type Paginator, type PageableListHandlerOptions } from "~/layers/mongo/types/paginate"
import {
  type Entity,
  type EntityModel,
  Cardinality,
  type EntityHandlerOptions,
  type EntityDeleteHandlerOptions,
  type EntityRelationshipHandlerOptions,
  EntityReferenceFieldDefinition,
  type EntityJSON,
  type EntityListOptions,
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
  // REFACTOR: Use getEntityFieldsDefinitions.
  const relationships = model
    .relationships({ filter: { cardinality: Cardinality.MANY_TO_MANY | Cardinality.MANY_TO_ONE }, flatten: true })
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
    const method = getMethod(event)
    const { [model.pk()]: id } = getRouterParams(event)

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

export const useEntityListHandler = function<E extends Entity = Entity> (model: EntityModel, options?: EntityHandlerOptions & PageableListHandlerOptions): EventHandler {
  return async function (event) {
    const { pathname: path } = getRequestURL(event)
    if (options?.discriminatorKey) {
      model = getDiscriminator<E>(event, model, options.discriminatorKey)
    }

    const query = model.find()

    const { page, pageSize } = await getPaginateOptions(event, model, options?.paginate || {})
    if (options?.paginate !== false) {
      query.skip((page - 1) * pageSize).limit(pageSize)
    }

    const select = getSelectOptions(event)
    if (Object.keys(select).length > 0) {
      const fields = selectEntityFieldDefinitions(model, select)
      const { populate = [], select: selection } = getSelectPopulate(fields)
      if (populate.length > 0) {
        populate?.forEach(p => query.populate(p))
      }
      if (selection.length > 0) {
        query.select(selection.concat(model.pk()).join(` `))
      }
    } else {
      const fields = getEntityFieldsDefinitions(model)
      fields
        .filter(f => f.type === `ref` && f.cardinality === `single`)
        .forEach(f => query.populate(f.path, useEntityType((f as EntityReferenceFieldDefinition).targetModelName).pk()))

      const projection = fields.reduce((projection, field) => ({ ...projection, [field.path]: field.cardinality === `multi` ? [] : 1 }), { _id: 1 })
      query.projection(projection)
    }

    const sort = getSortOptions(event)
    query.sort(Object.entries(sort).map(([field, direction]) => direction === `asc` ? field : `-${field}`).join(` `))

    const docs = await query.exec()

    const paginator = usePaginator(event, {
      totalItems: await model.count(),
      page,
      pageSize,
    })

    return {
      self: options?.paginate ? buildPageLink(path, { page, pageSize }) : path,
      items: docs.map(doc => doc.toJSON()),
      ...options?.paginate !== false ? paginator : {},
    }
  }
}

export const useEntityReadHandler = function<E extends Entity = Entity> (model: EntityModel, options?: EntityHandlerOptions): EventHandler {
  return async function (event) {
    const { [model.pk()]: pk } = getRouterParams(event)
    if (options?.discriminatorKey) {
      model = getDiscriminator<E>(event, model, options.discriminatorKey)
    }

    const query = model.findByPK(pk)
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
    const { [model.pk()]: pk } = getRouterParams(event)
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
    const { [model.pk()]: pk } = getRouterParams(event)
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

export const useEntityRelationshipListHandler = function<E extends Entity = Entity> (model: EntityModel, options: EntityRelationshipHandlerOptions & PageableListHandlerOptions): EventHandler {
  return async function (event) {
    let { pathname: path } = getRequestURL(event)
    const { [model.pk()]: pk } = getRouterParams(event)

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
    let relatedDocs: any[] = doc?.get(options.rel)

    let paginator: Paginator | undefined
    if (options?.paginate) {
      paginator = usePaginator(event, { totalItems: await model.count(), paginate: typeof options.paginate !== `object` ? options.paginate : {} })
      const { page, pageSize } = paginator

      const start = (page - 1) * pageSize
      const end = start + pageSize

      relatedDocs = relatedDocs.slice(start, end)
      path = buildPageLink(path, { page, pageSize })
    }

    return {
      self: path,
      items: relatedDocs,
      ...paginator ?? {},
    }
  }
}

export const useEntityRelationshipAddHandler = function<E extends Entity = Entity> (model: EntityModel, options: EntityRelationshipHandlerOptions): EventHandler {
  return async function (event) {
    const { [model.pk()]: pk } = getRouterParams(event)
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
    const { [model.pk()]: pk } = getRouterParams(event)
    const body = Object.values(await resolveEntityURLs<E>(await readBody(event), model))[0]

    if (options?.discriminatorKey) {
      model = getDiscriminator<E>(event, model, options.discriminatorKey)
    }

    const doc = await model.findByPK(pk)
    await model.updateOne({ _id: doc._id }, { $pull: { [options.rel]: body } })
    return $fetch(doc.url(options.rel))
  }
}

export function sendEntity <E extends Entity = Entity>(event: H3Event, entity: Document<Types.ObjectId, {}, E>, transform?: (entity: EntityJSON<E>) => EntityJSON<E>) {
  let json = entity.toJSON<EntityJSON<E>>({ flattenMaps: false })
  if (transform) {
    json = transform(json)
  }
  return json
}

export function sendEntityList <E extends Entity = Entity>(event: H3Event, entities: Document<Types.ObjectId, {}, E>[], options?: EntityListOptions<E>) {
  const { pathname } = getRequestURL(event)
  const paginator = usePaginator(event, { total: options?.total ?? entities.length })

  return {
    self: pathname,
    entities: entities.map((entity) => {
      let json = entity.toJSON<EntityJSON<E>>({ flattenMaps: false })
      if (options?.transform) {
        json = options.transform(json)
      }
      return json
    }),
    ...paginator,
  }
}
