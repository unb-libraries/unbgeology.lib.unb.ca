import { defu } from "defu"
import slugify from "slugify"
import {
  model as defineModel,
  model as loadModel,
  Schema,
  type SchemaDefinition,
} from "mongoose"
import {
  EntityFieldTypes,
  type EntityTypeOptions,
  type Entity,
  type EntityInstanceMethods,
  type EntityQueryHelpers,
  type EntityModel,
} from "~/layers/mongo/types/entity"

const defineEntityTypeOptions = function <E extends Entity = Entity> (options: EntityTypeOptions<E>, defaultOptions?: EntityTypeOptions<E>) {
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
  E extends Entity,
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
    statics: {
      baseURL() {
        return `/api/${this.collection.collectionName}`
      },
      findByPK(pk: string) {
        const path = Object.values(this.schema.paths)
          .find(path => path.options.alias === `pk`)?.path ?? `_id`
        return this.findOne().where(path, pk)
      },
      async findByURI(uri: string) {
        const { id: pk } = await $fetch<E>(uri)
        return pk
          ? await this.findByPK(pk)
          : null
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

export const useEntityType = function<E extends Entity = Entity, M extends EntityModel = EntityModel> (name: string) {
  return loadModel<E, M>(name)
}

export function defineEntityType <
  E extends Entity,
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
      default: function (this: Record<string, keyof E>) {
        let value = this.id.toString()
        if (typeof options.slug === `string`) {
          value = this[options.slug as string].toString()
        } else if (Array.isArray(options.slug)) {
          value = (options.slug as string[]).map(path => this[path]).join(` `)
          return slugify(value)
        } else if (typeof options.slug === `function`) {
          value = options.slug()
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

export const defineEntityBundle = function<E extends Entity = Entity, B extends E = E> (base: ReturnType<typeof defineEntityType<E>>, name: string, definition?: SchemaDefinition<B>, options?: EntityTypeOptions<B>) {
  const schemaOptions = defineEntityTypeOptions<B>(options ?? {}, base.schema.options)
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

export const defineEmbeddedEntityType = function<E extends Entity = Entity, I extends EntityInstanceMethods = EntityInstanceMethods> (baseTypeName: string, path: string, definition: SchemaDefinition<E>, options?: EntityTypeOptions<E>) {
  // const schema = useEntityTypeSchema(baseTypeName, definition, options)
  return EntityTypeSchema<E, I>(definition, options)

  // schema.method(`url`, function (this: HydratedDocument<E, I>, rel?: string) {
  //   const url = `${this.$parent()?.url(path)}/${this.id}`
  //   return !rel ? url : `${url}/${rel}`
  // // })

  // return schema
}
