import { defu } from "defu"
import { Schema, type SchemaDefinition, model as defineModel, Types, type FilterQuery } from "mongoose"
import type { DocumentSchema, AlterSchemaHandler, DocumentBase as IDocumentBase, DocumentModel, DocumentSchemaOptions } from "../../types/schema"
import { type DocumentQuery, type DocumentQueryResult, type Join } from "../../types/entity"
import { type Mutable } from "../../types"

type DefineDocumentSchema<D = any, TOptions extends any | undefined = undefined> =
  (TOptions extends undefined ? { (): DocumentSchema<D> } : { (options: TOptions): DocumentSchema<D> })
  & { mixin: <Dx = any>(schema: DocumentSchema<Dx>) => DefineDocumentSchema<D, TOptions> }

export function defineDocumentSchema<D = any, TOptions extends any | undefined = undefined>(definition: TOptions extends undefined ? DocumentSchema<D>[`paths`] : (options: TOptions) => DocumentSchema<D>[`paths`], options?: Partial<DocumentSchemaOptions<D>>) {
  const mixins: DocumentSchema[] = []
  const modifiers: AlterSchemaHandler[] = []

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

  const define = (typeof definition === `function`
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
    }) as DefineDocumentSchema<D, TOptions>

  define.mixin = <Dx = any>(mixin: DocumentSchema<Dx>) => {
    mixins.push(mixin)
    modifiers.push(mixin.alterSchema)
    return define
  }

  return define
}

export const DocumentBase = defineDocumentSchema<IDocumentBase>({
  created: {
    type: Schema.Types.Number,
    required: true,
    immutable: true,
    default: Date.now,
  },
  updated: {
    type: Schema.Types.Number,
    required: true,
    default: Date.now,
  },
})

export function defineDocumentModel<D extends IDocumentBase = IDocumentBase, B extends D | undefined = undefined>(name: string, definition: B extends undefined ? DocumentSchema<D> : DocumentSchema<NonNullable<B>>, base?: DocumentModel<D>): B extends undefined ? DocumentModel<D> : DocumentModel<NonNullable<B>> {
  const fullName = base ? `${base.name}.${name}` : name

  const getRoot = (model: DocumentModel): DocumentModel => model.base ? getRoot(model.base) : model
  const getRootModel = (model: DocumentModel) => getRoot(model).mongoose.model
  const schema = base && base as unknown as DocumentModel !== getRoot(base as unknown as DocumentModel)
    ? defineDocumentSchema({})
      .mixin(base.schema)
      .mixin(definition as unknown as DocumentSchema<Omit<NonNullable<B>, keyof D>>)
    : definition

  const Model = !base
    ? defineModel<D>(fullName, definition.schema as Schema<D>)
    : getRootModel(base as unknown as DocumentModel).discriminator<NonNullable<B>>(fullName, definition.schema)

  return {
    name,
    fullName,
    base,
    schema,
    mongoose: {
      model: Model,
    },
    new(body: B extends undefined ? Partial<D> : Partial<NonNullable<B>>) {
      return new Model(body)
    },
    find() {
      return !base
        ? DocumentQuery<D>(this as DocumentModel<D>)
        : DocumentQuery<NonNullable<B>>(this as unknown as DocumentModel<NonNullable<B>>)
    },
    findOne(filter: FilterQuery<D>) {
      return !base
        ? findDocument(this as DocumentModel<D>, filter)
        : findDocument(this as unknown as DocumentModel<NonNullable<B>>, filter)
    },
    findByID(id: string) {
      return !base
        ? findDocumentByID(this as DocumentModel<D>, id)
        : findDocumentByID(this as unknown as DocumentModel<NonNullable<B>>, id)
    },
    async create(body: B extends undefined ? Partial<D> | Partial<D>[] : Partial<B> | Partial<B>[]) {
      return !base
        ? await createDocument<D>(this as DocumentModel<D>, body as Partial<D> | Partial<D>[])
        : await createDocument<NonNullable<B>>(this as DocumentModel<NonNullable<B>>, body as Partial<NonNullable<B>> | Partial<NonNullable<B>>[])
    },
    async update(id: string, body: B extends undefined ? Partial<Mutable<D>> : Partial<Mutable<NonNullable<B>>>) {
      return !base
        ? await updateDocument<D>(this as DocumentModel<D>, id, body as Partial<Mutable<D>>)
        : await updateDocument<NonNullable<B>>(this as DocumentModel<NonNullable<B>>, id, body as Partial<Mutable<NonNullable<B>>>)
    },
    async delete(id: string) {
      await deleteDocument(this as DocumentModel, id)
    },
  } as unknown as B extends undefined ? DocumentModel<D> : DocumentModel<NonNullable<B>>
}

export function DocumentQuery<D extends IDocumentBase = IDocumentBase>(documentType: DocumentModel<D>): DocumentQuery<D> {
  const joins: Join[] = []
  const filters: any[] = []
  const selection: string[] = []
  const sort: [string, boolean][] = []
  const paginator: [number, number] = [1, 25]
  const handlers: ((query: DocumentQuery<D>) => void)[] = []

  return {
    use(...handlers: ((query: DocumentQuery<D>) => void)[]) {
      handlers.forEach(handler => handler(this))
      return this
    },
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
        .filter(({ localField: field }) => documentType.mongoose.model.schema.path(field) instanceof Types.ObjectId)
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
      if (selection.length > 0) {
        query.project(selection.reduce((projection, field) => ({ ...projection, [field]: 1 }), {}))
      }

      const [page, pageSize] = paginator
      query
        .facet({ documents: [{ $skip: (page - 1) * pageSize }, { $limit: pageSize }], total: [{ $count: `total` }] })
        .project({ documents: 1, total: 1 })

      return query
    },
    join<D extends IDocumentBase = IDocumentBase>(field: string, model: DocumentModel<D>) {
      joins.push({
        from: model.mongoose.model.collection.collectionName,
        localField: field,
        foreignField: `_id`,
        as: field,
      })
      return this
    },
    and(...fieldOrHandlers: (string | ((query: DocumentQuery<D>) => void))[]) {
      if (fieldOrHandlers.length === 0) {
        return this.where()
      } else {
        return typeof fieldOrHandlers[0] === `function`
          ? this.where(...fieldOrHandlers as ((query: DocumentQuery<D>) => void)[])
          : this.where(fieldOrHandlers[0])
      }
    },
    where(...fieldOrHandlers: (string | ((query: DocumentQuery<D>) => void))[]) {
      if (fieldOrHandlers.length === 0) { return this }

      if (typeof fieldOrHandlers[0] === `function`) {
        handlers.push(...fieldOrHandlers as ((query: DocumentQuery<D>) => void)[])
        return this
      }

      const field = fieldOrHandlers[0]
      return {
        eq: (value: string | number) => {
          filters.push({ [field]: value })
          return this
        },
        ex: () => {
          filters.push({ [field]: { $exists: true } })
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
        in: (value: (string | number)[]) => {
          filters.push({ [field]: { $in: value } })
          return this
        },
        nin: (value: (string | number)[]) => {
          filters.push({ [field]: { $nin: value } })
          return this
        },
        contains(value: string | number) {
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
    async then(resolve: (result: DocumentQueryResult<D>) => void, reject: (err: any) => void) {
      try {
        const [result] = await this.query().exec()
        const { documents, total } = result
        resolve({
          documents,
          update: async (body: Partial<Mutable<D>>) => {
            return await Promise.all(documents.map(async document => await updateDocument(documentType, `${document._id}`, body)))
          },
          delete: async () => {
            await Promise.all(documents.map(async document => await deleteDocument(documentType, `${document._id}`)))
          },
          total: total[0]?.total ?? 0,
        })
      } catch (err) {
        reject(err)
      }
    },
  }
}

function findDocument<D extends IDocumentBase = IDocumentBase>(Model: DocumentModel<D>, filter: FilterQuery<D>) {
  return Model.mongoose.model.findOne(filter)
}

function findDocumentByID<D extends IDocumentBase = IDocumentBase>(Model: DocumentModel<D>, id: string) {
  return findDocument(Model, { _id: id })
}

async function createDocument<D extends IDocumentBase = IDocumentBase>(Model: DocumentModel<D>, body: Partial<D> | Partial<D>[]) {
  return await Model.mongoose.model.create(body)
}

async function updateDocument<D extends IDocumentBase = IDocumentBase>(Model: DocumentModel<D>, id: string, body: Partial<Mutable<D>>) {
  const document = await findDocumentByID(Model, id)
  if (!document) {
    throw new Error(`Document not found`)
  }

  const original = document.toJSON()
  document.set({ label: body.label })
  await document.save()

  return [original, document.toJSON()] as [typeof original, typeof original]
}

async function deleteDocument(Model: DocumentModel<any>, id: string) {
  const document = await findDocumentByID(Model, id)
  await document?.deleteOne()
}
