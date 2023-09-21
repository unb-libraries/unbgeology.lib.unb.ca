import { defu } from "defu"
import slugify from "slugify"
import {
  model as defineModel,
  model as loadModel,
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
  type PK,
  type EntityQueryHelpers,
  type EntityModel,
} from "~/layers/mongo/types/entity"

const useEntityTypeSchema = function<E extends Entity = Entity, I extends EntityInstanceMethods = EntityInstanceMethods, Q extends EntityQueryHelpers = EntityQueryHelpers, M extends EntityModel<E, I, Q> = EntityModel<E, I, Q>> (name: string, definition: SchemaDefinition<E>, options?: EntityTypeOptions) {
  if (options?.slug) {
    definition.slug = {
      type: EntityFieldTypes.String,
      required: true,
      immutable: true,
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

  const schema = new Schema<E, M, I, Q>({
    ...definition,
    created: Schema.Types.Number,
    updated: Schema.Types.Number,
  }, {
    statics: {
      baseURL() {
        return `/api/${useEntityType(name).collection.collectionName}`
      },
      findByPK(pk: PK) {
        const path = useEntityType(name).pk()
        return this.findOne().where(path, pk)
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
      getRelationship(path: string) {
        return useEntityType(name).relationships({ flatten: true }).find(rel => rel.path === path)
      },
      relationships(options?: EntityRelationshipsTraverseOptions) {
        options = defu<EntityRelationshipsTraverseOptions, Required<EntityRelationshipsTraverseOptions>[]>(options || {}, {
          rootPath: ``,
          filter: {
            cardinality: Cardinality.ANY,
            includeUnmatchedParent: true,
          },
          flatten: false,
          nested: true,
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
            [Cardinality.MANY_TO_ONE, ps => ps instanceof RefeferencePath],
            [Cardinality.ONE_TO_MANY, ps => ps instanceof ArrayPath && ps.schema !== undefined],
            [Cardinality.MANY_TO_MANY, ps => ps instanceof ArrayPath && ps.caster instanceof RefeferencePath],
          ]

          const rel: EntityRelationship[] = []
          filters.forEach(([cardinality, filter]) => {
            const filtered = paths
              .filter(filter)
              .map<EntityRelationship>(ps => ({
                cardinality,
                path: ps.path,
                targetModelName: ps instanceof ArrayPath && ps.caster instanceof RefeferencePath
                  ? ps.caster.options.ref
                  : ps instanceof RefeferencePath
                    ? ps.options.ref
                    : undefined,
                nested: options.nested ? traverse(defu({ rootPath: buildPath(options.rootPath!, ps.path) }, options)) : [],
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
        const entityType = useEntityType(name)
        
        // TODO: Find the schema path recursively.
        const childSchema = entityType.schema.childSchemas.find(s => s.schema === doc.schema)
        const path = childSchema?.model.path

        ret.self = doc.url()
        ret.created &&= new Date(doc.created)
        ret.updated &&= new Date(doc.updated)

        const traverseOptions: EntityRelationshipsTraverseOptions = { filter: { cardinality: Cardinality.MANY_TO_MANY | Cardinality.ONE_TO_MANY }}
        if (path) { traverseOptions.rootPath = path }
        entityType
          .relationships(traverseOptions)
          .forEach((rel) => {
            ret[rel.path] = { self: doc.url(rel.path) }
          })

        delete ret.__v
        delete ret._id
        delete ret.__t
        delete ret[useEntityType(name).pk()]

        return ret
      },
    },
  })

  return schema
}

export const useEntityType = function<E extends Entity = Entity, M extends EntityModel = EntityModel> (name: string) {
  return loadModel<E, M>(name)
}

export const defineEntityType = function<E extends Entity, I extends EntityInstanceMethods = EntityInstanceMethods, Q extends EntityQueryHelpers = EntityQueryHelpers, M extends EntityModel<E, I, Q> = EntityModel<E, I, Q>> (name: string, definition: SchemaDefinition<E>, options?: EntityTypeOptions) {
  const schema = useEntityTypeSchema<E, I, Q, M>(name, definition, options)

  schema.method(`pk`, function (this: HydratedDocument<E, I>) {
    const path = useEntityType(name).pk()
    return this.get(path)
  })

  schema.method(`url`, function url(this: HydratedDocument<E, I>, rel?: string) {
    const type = `__t` in this ? String(this.__t) : ``
    const pk = this.pk()

    const build = useEntityType(name).baseURL().split(`/`).concat(pk)
    if (type) { build.splice(3, 0, type) }
    if (rel) { build.push(rel) }

    return build.join(`/`)
  })

  return defineModel<E, M, Q>(name, schema)
}

export const defineEmbeddedEntityType = function<E extends Entity = Entity, I extends EntityInstanceMethods = EntityInstanceMethods> (baseTypeName: string, path: string, definition: SchemaDefinition<E>, options?: EntityTypeOptions) {
  const schema = useEntityTypeSchema(baseTypeName, definition, options)
  
  schema.method(`url`, function(this: HydratedDocument<E, I>, rel?: string) {
    const url = `${this.$parent()?.url(path)}/${this.id}`
    return !rel ? url : `${url}/${rel}`
  })
  
  return schema
}