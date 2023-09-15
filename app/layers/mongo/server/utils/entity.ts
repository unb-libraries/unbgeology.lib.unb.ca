import { defu } from "defu"
import { model as defineModel, model as loadModel, Model, Schema, SchemaType, type SchemaDefinition } from "mongoose"
import { EntityFieldTypes, type Entity } from "~/layers/mongo/types/entity"

export const useEntityType = function<E extends Entity> (name: string) {
  return loadModel<E>(name)
}
export enum Cardinality {
  ONE_TO_ONE = 1,
  ONE_TO_MANY = 2,
  MANY_TO_ONE = 4,
  MANY_TO_MANY = 8,
  ANY = 15,
}

interface EntityRelationship {
  cardinality: Cardinality
  path: string
  nested?: EntityRelationship[]
}

interface RelationshipsTraverseOptions {
  rootPath?: string
  filter?: {
    cardinality?: Cardinality,
    includeUnmatchedParent?: boolean,
  },
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
      relationships(options?: RelationshipsTraverseOptions) {
        options = defu<RelationshipsTraverseOptions, Required<RelationshipsTraverseOptions>[]>(options || {}, {
          rootPath: ``,
          filter: {
            cardinality: Cardinality.ANY,
            includeUnmatchedParent: true,
          },
        })

        const traverse = (options: RelationshipsTraverseOptions): EntityRelationship[] => {
          const { Array: ArrayPath, ObjectId: RefeferencePath } = EntityFieldTypes
          const buildPath = function (...segments: string[]) {
            return segments.filter(s => s).join(`.`)
          }
          
          const paths = Object
            .values(options.rootPath ? this.schema.path(options.rootPath).schema?.paths ?? [] : this.schema.paths)
          .filter(schema => schema.path !== `_id`)
          
          const filters: [Cardinality, (pathSchema: SchemaType) => boolean][] = [
            [Cardinality.ONE_TO_ONE, ps => !(ps instanceof ArrayPath) && ps.schema !== undefined],
            [Cardinality.ONE_TO_MANY, ps => ps instanceof RefeferencePath],
            [Cardinality.MANY_TO_ONE, ps => ps instanceof ArrayPath && ps.schema !== undefined],
            [Cardinality.MANY_TO_MANY, ps => ps instanceof ArrayPath && ps.caster instanceof RefeferencePath],
          ]

          const rel: EntityRelationship[] = []
          filters.forEach(([cardinality, filter]) => {
            const filtered = paths
              .filter(filter)
              .map<EntityRelationship>(ps => ({
                cardinality,
                path: ps.path,
                nested: traverse(defu({ rootPath: buildPath(options.rootPath!, ps.path) }, options)),
              }))

            if (options.filter!.cardinality! & cardinality) {
              rel.push(...filtered)
            } else if (options.filter?.includeUnmatchedParent) {
              rel.push(...filtered.filter(rel => (rel.nested ?? []).length > 0))
            }
          })

        return rel
        }

        return traverse(options)
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
