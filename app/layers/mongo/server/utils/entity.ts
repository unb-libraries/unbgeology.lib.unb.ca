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
  type EntityTypeOptions,
  type EntityInstanceMethods,
  type EntityQueryHelpers,
  type EntityModel,
  type EntityDocument,
} from "~/layers/mongo/types/entity"

const defineEntityTypeOptions = function <E extends EntityDocument = EntityDocument> (options: EntityTypeOptions<E>, defaultOptions?: EntityTypeOptions<E>) {
  if (options?.toJSON?.transform && options?.toJSON?.transform !== true) {
    const customTransform = options.toJSON.transform
    if (defaultOptions?.toJSON?.transform) {
      const originalTransform = defaultOptions.toJSON.transform
      options.toJSON.transform = function (doc, ret, transformOptions) {
        // @ts-ignore
        let _ret = originalTransform(doc, ret, transformOptions)
        _ret = customTransform(doc, ret, transformOptions)
        return _ret
      }
    }
  }

  return defu(options, defaultOptions)
}

const EntityTypeSchema = function <
  E extends EntityDocument = EntityDocument,
  I extends EntityInstanceMethods = EntityInstanceMethods,
  Q extends EntityQueryHelpers = EntityQueryHelpers,
  M extends EntityModel<E, I, Q> = EntityModel<E, I, Q>
> (definition: SchemaDefinition<E>, options?: EntityTypeOptions<E>) {
  const schemaOptions = defineEntityTypeOptions(options ?? {}, {
    discriminatorKey: `type`,
    query: {
      paginate(page: number, pageSize: number) {
        return this
          .skip((page - 1) * pageSize)
          .limit(pageSize)
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
          const { id: pk } = await $fetch<E>(uri)
          return pk
            ? await this.findByPK(pk)
            : null
        }))
        return entities.filter(e => e)
      },
    },
    timestamps: {
      createdAt: `created`,
      updatedAt: `updated`,
      currentTime: () => Date.now(),
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
    created: Schema.Types.Number,
    updated: Schema.Types.Number,
  }, schemaOptions)

  if (!Object.values(schema.paths).some(path => path.options.alias === `pk`)) {
    schema.virtual(`pk`).get(function () {
      return this._id
    })
  }

  return schema
}

export const useEntityType = function<E extends EntityDocument = EntityDocument, M extends EntityModel = EntityModel> (name: string) {
  return loadModel<E, M>(name)
}

export function defineEntityType <
  E extends EntityDocument = EntityDocument,
  I extends EntityInstanceMethods = EntityInstanceMethods,
  Q extends EntityQueryHelpers = EntityQueryHelpers,
  M extends EntityModel<E, I, Q> = EntityModel<E, I, Q>
>(name: string, definition: SchemaDefinition<E>, options?: EntityTypeOptions<E>) {
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

  const schema = EntityTypeSchema<E, I, Q, M>(definition, options)
  const model = defineModel<E, M, Q>(name, schema)

  if (!(`uri` in model.schema.virtuals)) {
    model.schema.virtual(`uri`).get(function () {
      return `/api/${model.collection.collectionName}/${this.pk}`
    })
  }

  return model
}

export const defineEntityBundle = function<E extends EntityDocument = EntityDocument, B extends E = E> (base: ReturnType<typeof defineEntityType<E>>, name: string, definition?: SchemaDefinition<B>, options?: EntityTypeOptions<B>) {
  const baseSchemOptions = defineEntityTypeOptions<B>({
    toJSON: {
      transform(doc, ret, options) {
        if (options?.discriminatorKey) {
          delete ret[options.discriminatorKey]
        } else {
          delete ret.type
        }
      },
    },
  }, base.schema.options)
  const schemaOptions = defineEntityTypeOptions<B>(options ?? {}, baseSchemOptions)
  let schema: Schema

  let baseModel = base
  while (baseModel.baseModelName) {
    baseModel = useEntityType(baseModel.modelName)
  }

  if (baseModel === base) {
    schema = new Schema(definition || {}, schemaOptions)
  } else {
    const schemaDefinition = defu(definition ?? {}, base.schema.obj)
    schema = new Schema(schemaDefinition, schemaOptions)
  }

  return baseModel.discriminator<B>(`${base.modelName}.${name}`, schema, name.toLowerCase())
}

export const defineEmbeddedEntityType = function<E extends EntityDocument = EntityDocument, I extends EntityInstanceMethods = EntityInstanceMethods> (definition: SchemaDefinition<E>, options?: EntityTypeOptions<E>) {
  const schema = EntityTypeSchema<E, I>(definition, defineEntityTypeOptions(options ?? {}))

  if (!(`uri` in schema.virtuals)) {
    schema.virtual(`uri`).get(function () {
      const path: string = Object.entries(this.parent()?.schema.paths)
        .find(([_, path]) => path.schema === schema)![0]
      return `${this.parent().url()}/${path}/${this.pk}`
    })
  }

  return schema
}
