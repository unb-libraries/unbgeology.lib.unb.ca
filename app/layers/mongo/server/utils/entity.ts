import { defu } from "defu"
import slugify from "slugify"
import {
  model as defineModel,
  model as loadModel,
  Schema,
  type SchemaDefinition,
  type UpdateQuery,
  type QueryOptions,
} from "mongoose"
import {
  EntityFieldTypes,
  type DocumentTypeOptions,
  type EntityInstanceMethods,
  type EntityQueryHelpers,
  type EntityModel,
  type EntityDocument,
  type DocumentBundleOptions,
  type DocumentQuery,
  type Join,
  type EntityQueryFilter,
} from "../../types/entity"
import type { DocumentBase, DocumentModel } from "../../types/schema"

const defineDocumentTypeOptions = function <E extends EntityDocument = EntityDocument> (options: DocumentTypeOptions<E>, defaultOptions?: DocumentTypeOptions<E>) {
  if (options?.toJSON?.transform && options?.toJSON?.transform !== true) {
    const customTransform = options.toJSON.transform
    if (defaultOptions?.toJSON?.transform) {
      const originalTransform = defaultOptions.toJSON.transform
      options.toJSON.transform = function (doc, ret, transformOptions) {
        // @ts-ignore
        let _ret = originalTransform(doc, ret, transformOptions)
        _ret = customTransform(doc, _ret, transformOptions)
        return _ret
      }
    }
  }

  return defu(options, defaultOptions)
}

const DocumentTypeSchema = function <
  E extends EntityDocument = EntityDocument,
  I extends EntityInstanceMethods = EntityInstanceMethods,
  Q extends EntityQueryHelpers = EntityQueryHelpers,
  M extends EntityModel<E, I, Q> = EntityModel<E, I, Q>
> (definition: SchemaDefinition<E>, options?: DocumentTypeOptions<E>) {
  const schemaOptions = defineDocumentTypeOptions(options ?? {}, {
    discriminatorKey: `type`,
    query: {
      paginate(page: number, pageSize: number) {
        return this
          .skip((page - 1) * pageSize)
          .limit(pageSize)
      },
      search(search: string) {
        this
          .where({ $text: { $search: search } })
          .sort({ score: { $meta: `textScore` } })
          .projection({ score: { $meta: `textScore` } })
        return this
      },
    },
    methods: {
      url() {
        return `/api/${this.collection.collectionName}/${this.pk}`
      },
    },
    statics: {
      baseURL() {
        return `/api/${this.collection.collectionName}`
      },
      findByPK(pk: string) {
        const path = Object.values(this.schema.paths)
          .find(path => path.options.alias === `pk`)?.path ?? `_id`
        return this.findOne().where(path, pk)
      },
      findByPKAndUpdate(pk: string, update: UpdateQuery<E>, options?: QueryOptions<E>) {
        const path = Object.values(this.schema.paths)
          .find(path => path.options.alias === `pk`)?.path ?? `_id`
        return this.findOneAndUpdate({ [path as keyof E]: pk }, update, options)
      },
      findByPKAndDelete(pk: string, options?: QueryOptions<E>) {
        const path = Object.values(this.schema.paths)
          .find(path => path.options.alias === `pk`)?.path ?? `_id`
        return this.findOneAndDelete({ [path as keyof E]: pk }, options)
      },
      findBySlug(slug: string) {
        return this.findOne().where(`slug`, slug.toLowerCase())
      },
      findBySlugAndUpdate(slug: string, update: UpdateQuery<E>, options?: QueryOptions<E>) {
        return this.findOneAndUpdate({ slug: slug.toLowerCase() }, update, options)
      },
      findBySlugAndDelete(slug: string, options?: QueryOptions<E>) {
        return this.findOneAndDelete({ slug: slug.toLowerCase() }, options)
      },
      async findByURI(uri: string) {
        const entities = await this.findManyByURI([uri])
        return entities.length > 0
          ? entities[0]
          : null
      },
      async findManyByURI(uris: string[]) {
        const entities = await Promise.all(uris.map(async (uri) => {
          const pkPath = Object.values(this.schema.paths)
            .find(path => path.options.alias === `pk`)?.path ?? `id` as keyof EntityDocument<E>
          const { [pkPath]: pk } = await $fetch<E>(uri)
          return pk
            ? await this.findByPK(pk)
            : null
        }))
        return entities.filter(e => e)
      },
    },
    toJSON: {
      virtuals: true,
      transform(doc, ret, transformOptions) {
        ret.self = ret.uri
        ret.id = ret.pk

        if (doc.schema.path(`created`)) {
          ret.created &&= new Date(doc.get(`created`))
        }
        if (doc.schema.path(`updated`)) {
          ret.updated &&= new Date(doc.get(`updated`))
        }

        if (options?.discriminatorKey) {
          delete ret[options.discriminatorKey]
        } else {
          delete ret.type
        }

        delete ret.uri
        delete ret.__v
        delete ret._id
        delete ret.pk
        delete ret.slug
        delete ret.__t

        return ret
      },
    },
  })

  const schema = new Schema<E, M, I, Q>({
    ...definition,
    created: {
      type: Schema.Types.Number,
      required: true,
      mutable: false,
      default: Date.now(),
    },
    updated: {
      type: Schema.Types.Number,
      required: true,
      mutable: false,
      default: Date.now(),
    },
  }, schemaOptions)

  if (!Object.values(schema.paths).some(path => path.options.alias === `pk`)) {
    schema.virtual(`pk`).get(function () {
      return this._id
    })
  }

  return schema
}

export const useDocumentType = function<E extends EntityDocument = EntityDocument, M extends EntityModel = EntityModel> (name: string) {
  return loadModel<E, M>(name)
}

export function defineDocumentType <
  E extends EntityDocument = EntityDocument,
  I extends EntityInstanceMethods = EntityInstanceMethods,
  Q extends EntityQueryHelpers = EntityQueryHelpers,
  M extends EntityModel<E, I, Q> = EntityModel<E, I, Q>
>(name: string, definition: SchemaDefinition<E>, options?: DocumentTypeOptions<E>) {
  if (options?.slug) {
    definition.slug = {
      type: EntityFieldTypes.String,
      required: true,
      immutable: true,
      select: true,
      alias: `pk`,
      default: function (this: { [K in keyof EntityDocument<E>]: E[K] }) {
        let value = this.id.toString()
        if (typeof options.slug === `string`) {
          // TODO: Support dotted syntax for nested fields, e.g. "field.subfield"
          const fieldValue = this[options.slug as keyof EntityDocument<E>]
          if (typeof fieldValue === `string`) {
            value = fieldValue
          }
        } else if (Array.isArray(options.slug)) {
          value = (options.slug as (keyof EntityDocument<E>)[]).map(path => this[path]).join(` `)
          return slugify(value)
        } else if (typeof options.slug === `function`) {
          value = options.slug(this)
        }
        return slugify(value, { lower: true, strict: true })
      },
    }
  }

  const schema = DocumentTypeSchema<E, I, Q, M>(definition, options)
  const model = defineModel<E, M, Q>(name, schema)

  if (!(`uri` in model.schema.virtuals)) {
    model.schema.virtual(`uri`).get(function () {
      return `/api/${model.collection.collectionName}/${this.pk}`
    })
  }

  return model
}

export const defineDocumentBundle = function<E extends EntityDocument = EntityDocument, B extends E = E> (parent: ReturnType<typeof defineDocumentType<E>>, name: string, definition?: SchemaDefinition<B>, options?: DocumentBundleOptions<B>) {
  const { type = name, ...bundleOptions } = options ?? {}
  const schemaOptions = defineDocumentTypeOptions<B>(bundleOptions ?? {}, parent.schema.options)
  let schema: Schema

  const baseModelName = parent.modelName.split(`.`)[0]
  const base = useDocumentType<E>(baseModelName)

  if (base === parent) {
    schema = new Schema(definition || {}, schemaOptions)
  } else {
    const schemaDefinition = defu(definition ?? {}, parent.schema.obj)
    schema = new Schema(schemaDefinition, schemaOptions)
  }

  const typeValue = typeof type === `function` ? type(name, parent) : type!

  return base.discriminator<B>(`${parent.modelName}.${name}`, schema, typeValue.toLowerCase())
}

export const defineEmbeddedDocumentType = function<E extends EntityDocument = EntityDocument, I extends EntityInstanceMethods = EntityInstanceMethods> (definition: SchemaDefinition<E>, options?: DocumentTypeOptions<E>) {
  const schema = DocumentTypeSchema<E, I>(definition, defineDocumentTypeOptions(options ?? {}))

  if (!(`uri` in schema.virtuals)) {
    schema.virtual(`uri`).get(function () {
      const path: string = Object.entries(this.parent()?.schema.paths)
        .find(([_, path]) => path.schema === schema)![0]
      return `${this.parent().url()}/${path}/${this.pk}`
    })
  }

  return schema
}

export function getDocumentQuery<D extends DocumentBase = DocumentBase>(documentType: DocumentModel<D>): DocumentQuery<D> {
  const joins: Join[] = []
  const filters: any[] = []
  const selection: string[] = []
  const sort: [string, boolean][] = []
  const paginator: [number, number] = [1, 25]
  const handlers: ((query: DocumentQuery<D>) => void)[] = []

  return {
    query() {
      const query = documentType.mongoose.model.aggregate()

      // apply handlers
      while (handlers.length > 0) {
        const handler = handlers.shift()!
        handler(this)
      }

      // lookup stage
      joins.forEach((join) => {
        query.lookup(join)
      })

      // match stage
      filters.forEach((field) => {
        query.match(field)
      })

      // pre-sort stage
      sort.forEach(([field]) => {
        query
          .addFields({ [`no${field}`]: { $or: [{ $eq: [`$${field}`, []] }, { $eq: [`$${field}`, null] }] } })
      })

      // unwind stage: unwind all multi-value joined fields
      joins
        .filter(({ localField: field }) => documentType.mongoose.model.schema.path(field) instanceof EntityFieldTypes.ObjectId)
        .forEach(({ localField: field }) => {
          query.unwind({ path: `$${field}`, preserveNullAndEmptyArrays: true })
        })

      // sort stage
      if (sort.length > 0) {
        query.sort(sort.map(([field, asc]) => `no${field} ${asc ? `` : `-`}${field}`).join(` `))
      } else {
        query.sort(`_id`)
      }

      // project stage
      query.project(selection.join(` `))

      const [page, pageSize] = paginator
      query
        .facet({ documents: [{ $skip: (page - 1) * pageSize }, { $limit: pageSize }], total: [{ $count: `total` }] })
        .project({ documents: 1, total: 1 })

      return query
    },
    join<D extends DocumentBase = DocumentBase>(field: string, model: DocumentModel<D>) {
      joins.push({
        from: model.mongoose.model.collection.collectionName,
        localField: field,
        foreignField: `_id`,
        as: field,
      })
      return this
    },
    and(...fieldOrHandlers: (string | ((query: DocumentQuery) => void))[]) {
      if (typeof fieldOrHandlers[0] === `function`) {
        const handlers = fieldOrHandlers
        return this.where(...handlers as ((query: DocumentQuery) => void)[])
      }
      return this.where(fieldOrHandlers[0])
    },
    where(...fieldOrHandlers: (string | ((query: DocumentQuery) => void))[]) {
      if (typeof fieldOrHandlers[0] === `function`) {
        handlers.push(...fieldOrHandlers as ((query: DocumentQuery) => void)[])
        return this
      }

      const field = fieldOrHandlers[0]
      return {
        eq: (value: string | number) => {
          filters.push({ [field]: value })
          return this
        },
        ne: (value: string | number) => {
          filters.push({ [field]: { $ne: value } })
          return this
        },
        match: (pattern: RegExp) => {
          filters.push({ [field]: { $regex: pattern } })
          return this
        },
        in: (value: string[] | number[]) => {
          filters.push({ [field]: { $in: value } })
          return this
        },
        nin: (value: string[] | number[]) => {
          filters.push({ [field]: { $nin: value } })
          return this
        },
        contains(value: string) {
          return this.eq(value)
        },
        gt: (value: number) => {
          filters.push({ [field]: { $gt: value } })
          return this
        },
        gte: (value: number) => {
          filters.push({ [field]: { $gte: value } })
          return this
        },
        lt: (value: number) => {
          filters.push({ [field]: { $lt: value } })
          return this
        },
        lte: (value: number) => {
          filters.push({ [field]: { $lte: value } })
          return this
        },
      }
    },
    expr(expr: object) {
      filters.push(expr)
      return this
    },
    select(...fields: string[]) {
      selection.push(...fields)
      return this
    },
    sort(...fields: (string | [string, boolean])[]) {
      fields.forEach((field) => {
        if (Array.isArray(field)) {
          const [fieldname, asc] = field
          sort.push([fieldname, asc])
        } else {
          sort.push([field, true])
        }
      })
      return this
    },
    paginate(page, pageSize) {
      paginator[0] = Math.max(1, page)
      paginator[1] = Math.min(500, pageSize)
      return this
    },
    async then(resolve: (result: { documents: D[], total: number }) => void, reject: (err: any) => void) {
      try {
        const [result] = await this.query().exec()
        const { documents, total } = result
        resolve({ documents, total: total[0]?.total ?? 0 })
      } catch (err) {
        reject(err)
      }
    },
  }
}
