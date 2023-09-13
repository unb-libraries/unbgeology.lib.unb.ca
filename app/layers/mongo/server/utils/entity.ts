import { model as defineModel, model as loadModel, Schema, type SchemaDefinition } from "mongoose"
import { type Entity } from "~/layers/mongo/types/entity"

export const useEntityType = function<E extends Entity> (name: string) {
  return loadModel<E>(name)
}

export const defineEntityType = function<E extends Entity> (name: string, definition: SchemaDefinition<E>) {
  const schema = new Schema<E>({
    ...definition,
    created: Schema.Types.Number,
    updated: Schema.Types.Number,
  }, {
    methods: {
      url() {
        const { collectionName } = this.collection
        const type = `__t` in this ? String(this.__t) : ``
        const id = String(this._id)
        return type
          ? `/api/${collectionName}/${type}/${id}`
          : `/api/${collectionName}/${id}`
      },
    },
    statics: {
      async findByUrl(url: string) {
        const id = url.split(`/`).at(-1)
        return await this.findById(id)
      },
    },
    timestamps: {
      createdAt: `created`,
      updatedAt: `updated`,
      currentTime: () => Date.now(),
    },
    toJSON: {
      transform(doc, ret, options) {
        ret.self = doc.url()
        ret.created &&= new Date(doc.created)
        ret.updated &&= new Date(doc.updated)

        delete ret.__v
        delete ret._id
        delete ret.__t

        return ret
      },
    },
  })

  return defineModel<E>(name, schema)
}

export const defineNestedEntityType = function<E extends object> (definition: SchemaDefinition<E>) {
  return definition
}

export const defineEmbeddedEntityType = function<E extends object> (definition: SchemaDefinition<E>) {
  return new Schema<E>(definition)
}

export const defineWeakEntityType = function<E extends Entity> (definition: SchemaDefinition<E>) {
  return new Schema<E>({
    ...definition,
    created: Schema.Types.Number,
    updated: Schema.Types.Number,
  })
}
