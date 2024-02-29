import { defu } from "defu"
import { Schema, type SchemaDefinition, model as defineModel, type ObjectId, Model } from "mongoose"
import type { DocumentSchema, AlterSchemaHandler, Document as IDocument, DocumentBase as IDocumentBase, DocumentModel, DocumentSchemaOptions } from "../../types/schema"

const mixins: DocumentSchema[] = []
const modifiers: AlterSchemaHandler[] = []
export function defineDocumentSchema<D = any, TOptions extends any | undefined = undefined>(definition: TOptions extends undefined ? DocumentSchema<D>[`paths`] : (options: TOptions) => DocumentSchema<D>[`paths`], options?: Partial<DocumentSchemaOptions<D>>): TOptions extends undefined ? () => DocumentSchema<D> : (options: TOptions) => DocumentSchema<D> {
  const mapMixinPaths = (mixin: DocumentSchema) => mixin.paths
  const createPaths = (options?: TOptions) => defu(typeof definition === `function` ? definition(options!) : definition, ...mixins.map(mapMixinPaths))

  const alterSchema = (schema: Schema<D>) => {
    modifiers.forEach(alter => alter(schema))
    options?.alterSchema?.(schema)
  }

  const createSchema = (paths: SchemaDefinition<D>) => {
    const schema = new Schema<D>(paths, { discriminatorKey: `type` })
    alterSchema(schema)
    return schema
  }

  return (typeof definition === `function`
    ? function (pathsOptions: TOptions) {
      return {
        paths: createPaths(pathsOptions),
        get schema() { return createSchema(this.paths) },
        alterSchema,
      }
    }
    : function () {
      return {
        paths: createPaths(),
        get schema() { return createSchema(this.paths) },
        alterSchema,
      }
    }) as TOptions extends undefined ? () => DocumentSchema<D> : (options: TOptions) => DocumentSchema<D>
}
defineDocumentSchema.mixin = <D = any>(mixin: DocumentSchema<D>) => {
  mixins.push(mixin)
  return defineDocumentSchema
}

export const DocumentBase = defineDocumentSchema<IDocumentBase>({
  created: {
    type: Schema.Types.Date,
    required: true,
    immutable: true,
    default: Date.now,
  },
  updated: {
    type: Schema.Types.Date,
    required: true,
    default: Date.now,
  },
})

export function defineDocumentModel<D extends IDocumentBase = IDocumentBase, B extends D | undefined = undefined>(name: string, definition: B extends undefined ? DocumentSchema<D> : DocumentSchema<NonNullable<B>>, base?: DocumentModel<D>): B extends undefined ? DocumentModel<D> : DocumentModel<NonNullable<B>> {
  const fullName = base ? `${base.name}.${name}` : name

  const getRoot = (model: DocumentModel): DocumentModel => model.base ? getRoot(model.base) : model
  const getRootModel = (model: DocumentModel) => getRoot(model).mongoose.model
  const schema = base && base as unknown as DocumentModel !== getRoot(base as unknown as DocumentModel)
    ? defineDocumentSchema.mixin(base.schema).mixin(definition as unknown as DocumentSchema<Omit<NonNullable<B>, keyof D>>)({})
    : definition

  const model = !base
    ? defineModel<D>(fullName, definition.schema as Schema<D>)
    : getRootModel(base as unknown as DocumentModel).discriminator<NonNullable<B>>(fullName, definition.schema)

  return {
    name,
    fullName,
    base,
    schema,
    mongoose: {
      model,
    },
    find() {
      return getDocumentQuery(model)
    },
    async findByID(id: ObjectId) {
      const doc = !base ? await (model as Model<D>).findById(id) : await (model as Model<NonNullable<B>>).findById(id)
      if (!doc) { return null }

      const clone = doc.$clone()
      return {
        get(path: B extends undefined ? keyof D : keyof Exclude<B, undefined>) {
          return doc.get(path as Extract<keyof B extends undefined ? D : Exclude<B, undefined>, string>)
        },
        set(path: B extends undefined ? keyof D : keyof Exclude<B, undefined>, value: D[B extends undefined ? keyof D : keyof Exclude<B, undefined>]) {
          doc.set(path as Extract<keyof B extends undefined ? D : Exclude<B, undefined>, string>, value)
          return this as B extends undefined ? IDocument<D> : IDocument<NonNullable<B>>
        },
        async update() {
          const before = doc.modifiedPaths()
            .map(path => ({ [path]: clone.get(path) }))
            .reduce((diff, update) => ({ ...diff, ...update }), {})
          const after = doc.modifiedPaths()
            .map(path => ({ [path]: doc.get(path) }))
            .reduce((diff, update) => ({ ...diff, ...update }), {})
          await doc.save()
          return { before, after } as { before: B extends undefined ? Partial<D> : Partial<B>, after: B extends undefined ? Partial<D> : Partial<B> }
        },
        async delete() {
          await doc.deleteOne()
        },
      }
    },
    async create(body: B extends undefined ? D : B) {
      const { _id } = !base
        ? await (model as Model<D>).create(body)
        : await (model as Model<NonNullable<B>>).create(body)
      return (await this.findByID(_id))!
    },
  } as B extends undefined ? DocumentModel<D> : DocumentModel<NonNullable<B>>
}
