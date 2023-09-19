import { defu } from "defu"
import { 
  model as defineModel,
  model as loadModel,
  Model,
  Schema,
  SchemaType,
  type HydratedDocument,
  type SchemaDefinition,
} from "mongoose"
import { 
  EntityFieldTypes,
  type EntityTypeOptions,
  type Entity,
  Cardinality,
  type EntityRelationship,
  type EntityRelationshipsTraverseOptions,
  type EntityInstanceMethods,
  type EntityModel,
} from "~/layers/mongo/types/entity"

export const useEntityType = function<E extends Entity = Entity, M extends EntityModel = EntityModel> (name: string) {
  return loadModel<E, M>(name)
}

export const defineEntityType = function<E extends Entity, M extends EntityModel = EntityModel, I extends EntityInstanceMethods = EntityInstanceMethods> (name: string, definition: SchemaDefinition<E>, options?: EntityTypeOptions) {
  const schema = new Schema<E, M, I>({
    ...definition,
    created: Schema.Types.Number,
    updated: Schema.Types.Number,
  }, {
    statics: {
      baseURL() {
        return `/api/${useEntityType(name).collection.collectionName}`
      },
      async findByPK(pk: string) {
        const path = useEntityType(name).pk()
        return await this.findOne().where(path, pk)
      },
      async findByURL(url: string) {
        const pk = url.split(`/`).at(-1)
        return pk
          ? await useEntityType(name).findByPK(pk)
          : undefined
      },
      pk() {
        const pk = options?.pk || `_id`
        return useEntityType(name).schema.path(pk) ? pk : `_id`
      },
      relationships(options?: EntityRelationshipsTraverseOptions) {
        options = defu<EntityRelationshipsTraverseOptions, Required<EntityRelationshipsTraverseOptions>[]>(options || {}, {
          rootPath: ``,
          filter: {
            cardinality: Cardinality.ANY,
            includeUnmatchedParent: true,
          },
          flatten: false,
        })

        const traverse = (options: EntityRelationshipsTraverseOptions): EntityRelationship[] => {
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

          const flatten = (ers: EntityRelationship[]) => {
            ers.forEach((er) => {
              ers.push(...flatten((er.nested ?? []).map(n => ({
                ...n,
                path: `${er.path}.${n.path}`,
              }))))
              delete er.nested
              return er
            })
            return ers
          }

          return options.flatten
            ? flatten(rel).filter(rel => rel.cardinality & options.filter!.cardinality!)
            : rel
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

        useEntityType(name)
          .relationships({ filter: { cardinality: ~Cardinality.ONE_TO_ONE } })
          .forEach((rel) => {
            ret[rel.path] &&= { self: doc.url(rel.path) }
          })

        delete ret.__v
        delete ret._id
        delete ret.__t
        delete ret[useEntityType(name).pk()]

        return ret
      },
    },
  })

  schema.method(`pk`, function (this: HydratedDocument<E, I>) {
    const path = useEntityType(name).pk()
    return this.get(path)
  })

  schema.method(`url`, function url(this: HydratedDocument<E, I>, rel?: string) {
    const type = `__t` in this ? String(this.__t) : ``
    const pk = this.pk()

    const build = useEntityType(name).baseURL().split(`/`).concat(pk)
    if (type) { build.splice(2, 0, type) }
    if (rel) { build.push(rel) }

    return build.join(`/`)
  })

  return defineModel<E, M>(name, schema)
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
