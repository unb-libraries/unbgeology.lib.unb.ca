import { defu } from "defu"
import { Schema, type SchemaDefinition, model as defineModel, Types } from "mongoose"
import type { DocumentSchema, AlterSchemaHandler, Document as IDocument, DocumentBase as IDocumentBase, DocumentModel, DocumentSchemaOptions, ObjectProperties } from "../../types/schema"
import { type DocumentQuery, type DocumentQueryResult, type Join } from "../../types/entity"

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
      !base
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
    and(...fieldOrHandlers: (string | ((query: DocumentQuery) => void))[]) {
      if (typeof fieldOrHandlers[0] === `function`) {
        const handlers = fieldOrHandlers
        return this.where(...handlers as ((query: DocumentQuery) => void)[])
      }
      return this.where(fieldOrHandlers[0])
    },
    where(...fieldOrHandlers: (string | ((query: DocumentQuery) => void))[]) {
      if (fieldOrHandlers.length === 0) { return this }

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
        const query = this.query
        const [result] = await query().exec()
        const { documents, total } = result
        resolve({
          documents,
          async update(body: Partial<Mutable<D>>) {
            await documentType.mongoose.model.updateMany({ _id: { $in: documents.map(({ _id }) => _id) } }, body as Partial<D>)
            const [{ documents: updated }] = await query().exec()
            return updated.map((updated, index) => diff<D>(documents[index], updated).map(document => ({
              _id: documents[index]._id,
              ...document,
            }))) as DocumentDiff<D>[]
          },
          async delete() {
            await documentType.mongoose.model.deleteMany({ _id: { $in: documents.map(({ _id }) => _id) } })
          },
          total: total[0]?.total ?? 0,
        })
      } catch (err) {
        reject(err)
      }
    },
  }
}

function findDocument<D extends IDocumentBase = IDocumentBase>(Model: DocumentModel<D>) {
  const query = DocumentQuery(Model)
  return {
    ...query,
    async then(resolve: (document: IDocument<D> | null) => void, reject: (err: any) => void) {
      try {
        const { documents } = await query.paginate(1, 1)
        const document = documents[0]
        if (document) {
          const clone = JSON.parse(JSON.stringify(document)) as IDocument<D>
          Object.assign(document, {
            async delete() {
              return await Model.mongoose.model.deleteOne({ _id: document._id })
            },
            async update(body?: Partial<D>) {
              if (body) {
                await Model.update(`${document._id}`, body)
                const updated = await Model.findByID(`${document._id}`)
                return diff<D>(clone, updated).map(document => ({ _id: clone._id, ...document }))
              } else {
                return await this.save()
              }
            },
            async save() {
              await Model.mongoose.model.updateOne({ _id: document._id }, document)
              const updated = await Model.findByID(`${document._id}`)
              return diff<D>(clone, updated).map(document => ({ _id: clone._id, ...document }))
            },
          })
        }
        resolve(document as IDocument<D> | null)
      } catch (err: any) {
        reject(err)
      }
    },
  }
}

function findDocumentByID<D extends IDocumentBase = IDocumentBase>(Model: DocumentModel<D>, id: string) {
  const { join, select, then } = findDocument(Model).where(`_id`).eq(new Types.ObjectId(id))
  return {
    join,
    select,
    then,
  }
}

async function createDocument<D extends IDocumentBase = IDocumentBase>(Model: DocumentModel<D>, body: Partial<D> | Partial<D>[]) {
  return await Model.mongoose.model.create(body)
}

function diff<T extends object = object>(obj: T, clone: T): [Partial<T>, Partial<T>] {
  const entries = Object.entries(obj) as [keyof ObjectProperties<T>, T[keyof ObjectProperties<T>]][]
  const diffs: [keyof T, [T[keyof T], T[keyof T]]][] = entries
    .filter(([, value]) => typeof value !== `function`)
    .filter(([path, value]) => JSON.stringify(value) !== JSON.stringify(clone[path]))
    .map(([path, value]) => [path, typeof value !== `object`
      ? [value, clone[path]]
      : diff(value as object, clone[path] as object)]) as [keyof T, [T[keyof T], T[keyof T]]][]

  return [
    Object.fromEntries(diffs.map(([path, diffs]) => [path, diffs[0]])) as Partial<T>,
    Object.fromEntries(diffs.map(([path, diffs]) => [path, diffs[1]])) as Partial<T>,
  ]
}

async function updateDocument<D extends IDocumentBase = IDocumentBase>(Model: DocumentModel<D>, id: string, body: Partial<Mutable<D>>) {
  await Model.mongoose.model.updateOne({ _id: id }, body as Partial<D>)
}

async function deleteDocument(Model: DocumentModel, id: string) {
  await Model.mongoose.model.deleteOne({ _id: id })
}
