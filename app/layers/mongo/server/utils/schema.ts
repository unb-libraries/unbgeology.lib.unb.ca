import { defu } from "defu"
import { Schema, type SchemaDefinition, model as defineModel, Types, type FilterQuery } from "mongoose"
import type { DocumentSchema, AlterSchemaHandler, DocumentBase as IDocumentBase, DocumentModel, DocumentSchemaOptions } from "../../types/schema"
import { type DocumentQuery, type DocumentQueryMethod, type DocumentQueryResult, type DocumentUpdateQueryResult, type Join } from "../../types/entity"
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
    findOne() {
      return !base
        ? DocumentQuery(this as DocumentModel<D>, { method: `findOne` })
        : DocumentQuery(this as unknown as DocumentModel<NonNullable<B>>, { method: `findOne` })
    },
    findByID(id: string) {
      const { select, use, then } = !base
        ? (this as DocumentModel<D>).findOne().where(`_id`).eq(new Types.ObjectId(id))
        : (this as unknown as DocumentModel<NonNullable<B>>).findOne().where(`_id`).eq(new Types.ObjectId(id))
      return {
        select,
        use,
        then,
      }
    },
    async create(body: B extends undefined ? Partial<D> | Partial<D>[] : Partial<B> | Partial<B>[]) {
      return !base
        ? await createDocument<D>(this as DocumentModel<D>, body as Partial<D> | Partial<D>[])
        : await createDocument<NonNullable<B>>(this as DocumentModel<NonNullable<B>>, body as Partial<NonNullable<B>> | Partial<NonNullable<B>>[])
    },
    update(body: B extends undefined ? Partial<Mutable<D>> : Partial<Mutable<NonNullable<B>>>) {
      const { then, ...query } = !base
        ? DocumentQuery(this as DocumentModel<D>)
        : DocumentQuery(this as unknown as DocumentModel<NonNullable<B>>)
      return {
        ...query,
        then: async (resolve: (result: B extends undefined ? DocumentUpdateQueryResult<D> : DocumentSchemaOptions<NonNullable<B>>) => void, reject: () => void) => {
          await then(async ({ documents, total }) => {
            const updates = !base
              ? await Promise.all(documents.map(document => updateDocument<D>(this as DocumentModel<D>, `${document._id}`, body as Partial<Mutable<D>>)))
              : await Promise.all(documents.map(document => updateDocument<NonNullable<B>>(this as unknown as DocumentModel<NonNullable<B>>, `${document._id}`, body as Partial<Mutable<NonNullable<B>>>)))
            resolve({ documents: updates, total } as B extends undefined ? DocumentUpdateQueryResult<D> : DocumentSchemaOptions<NonNullable<B>>)
          }, reject)
        },
      }
    },
    updateOne(body: B extends undefined ? Partial<Mutable<D>> : Partial<Mutable<NonNullable<B>>>) {
      const { then, ...query } = !base
        ? DocumentQuery(this as DocumentModel<D>, { method: `findOne` })
        : DocumentQuery(this as unknown as DocumentModel<NonNullable<B>>, { method: `findOne` })
      return {
        ...query,
        then: async (resolve: (result: B extends undefined ? DocumentUpdateQueryResult<D, `findOne`> : DocumentUpdateQueryResult<NonNullable<B>, `findOne`>) => void, reject: () => void) => {
          await then(async (document) => {
            const update = !base
              ? await updateDocument<D>(this as DocumentModel<D>, `${document._id}`, body as Partial<Mutable<D>>)
              : await updateDocument<NonNullable<B>>(this as unknown as DocumentModel<NonNullable<B>>, `${document._id}`, body as Partial<Mutable<NonNullable<B>>>)
            resolve(update as B extends undefined ? [D, D] : [NonNullable<B>, NonNullable<B>])
          }, reject)
        },
      }
    },
    updateByID(id: string, body: B extends undefined ? Partial<Mutable<D>> : Partial<Mutable<NonNullable<B>>>) {
      return !base
        ? (this as DocumentModel<D>).updateOne(body as Partial<Mutable<D>>).where(`_id`).eq(new Types.ObjectId(id))
        : (this as unknown as DocumentModel<NonNullable<B>>).updateOne(body as Partial<Mutable<NonNullable<B>>>).where(`_id`).eq(new Types.ObjectId(id))
    },
    delete() {
      const { then, ...query } = !base
        ? DocumentQuery(this as DocumentModel<D>)
        : DocumentQuery(this as unknown as DocumentModel<NonNullable<B>>)
      return {
        ...query,
        then: async (resolve: (result: { total: number }) => void, reject: () => void) => {
          await then(async ({ documents, total }) => {
            await Promise.all(documents.map(document => document.delete()))
            resolve({ total })
          }, reject)
        },
      }
    },
    deleteOne() {
      const { then, ...query } = DocumentQuery(this as DocumentModel<D>, { method: `findOne` })
      return {
        ...query,
        then: async (resolve: () => void, reject: () => void) => {
          await then(async (document) => {
            await document.delete()
            resolve()
          }, reject)
        },
      }
    },
    deleteByID(id: string) {
      return !base
        ? (this as DocumentModel<D>).deleteOne().where(`_id`).eq(new Types.ObjectId(id))
        : (this as unknown as DocumentModel<NonNullable<B>>).findOne().where(`_id`).eq(new Types.ObjectId(id))
    },
  } as unknown as B extends undefined ? DocumentModel<D> : DocumentModel<NonNullable<B>>
}

type AggregateResult<D extends IDocumentBase = IDocumentBase> = Pick<DocumentQueryResult<D>, `documents`> & { total: [{ total: number }] }

export function DocumentQuery<D extends IDocumentBase = IDocumentBase, M extends DocumentQueryMethod = `findMany`>(documentType: DocumentModel<D>, options?: { method: M }) {
  const joins: Join[] = []
  const filters: any[] = []
  const selection: string[] = []
  const sort: [string, boolean][] = []
  const paginator: [number, number] = [1, 25]
  const handlers: ((query: DocumentQuery<D, M>) => void)[] = []

  function buildQuery() {
    const aggregate = documentType.mongoose.model.aggregate<AggregateResult<D>>()

    // apply handlers
    while (handlers.length > 0) {
      const handler = handlers.shift()!
      handler(query as DocumentQuery<D, M>)
    }

    // lookup stage
    joins.forEach((join) => {
      aggregate.lookup(join)
    })

    // match stage
    filters.forEach((field) => {
      aggregate.match(field)
    })

    // pre-sort stage
    sort.forEach(([field]) => {
      aggregate
        .addFields({ [`no${field}`]: { $or: [{ $eq: [`$${field}`, []] }, { $eq: [`$${field}`, null] }] } })
    })

    // unwind stage: unwind all multi-value joined fields
    joins
      .filter(({ localField: field }) => documentType.mongoose.model.schema.path(field) instanceof Types.ObjectId)
      .forEach(({ localField: field }) => {
        aggregate.unwind({ path: `$${field}`, preserveNullAndEmptyArrays: true })
      })

    // sort stage
    if (sort.length > 0) {
      aggregate.sort(sort.map(([field, asc]) => `no${field} ${asc ? `` : `-`}${field}`).join(` `))
    } else {
      aggregate.sort(`_id`)
    }

    // project stage
    if (selection.length > 0) {
      aggregate.project(selection.reduce((projection, field) => ({ ...projection, [field]: 1 }), {}))
    }

    const [page, pageSize] = paginator
    aggregate
      .facet({ documents: [{ $skip: (page - 1) * pageSize }, { $limit: pageSize }], total: [{ $count: `total` }] })
      .project({ documents: 1, total: 1 })

    return aggregate
  }

  const query = {
    use(...newHandlers: ((query: DocumentQuery<D, M>) => void)[]) {
      handlers.push(...newHandlers)
      return this
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
    and(field: string) {
      return this.where(field)
    },
    where(field: string) {
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
    paginate(page: number, pageSize: number) {
      paginator[0] = Math.max(1, page)
      paginator[1] = Math.min(500, pageSize)
      return this
    },
    async then(resolve: (result: DocumentQueryResult<D, M>) => void, reject: (err: any) => void) {
      try {
        const [result] = await buildQuery().exec()
        const { documents, total } = result

        const assign = (document: D) => Object.assign(document, {
          update: async (body: Partial<Mutable<D>>) => {
            return await updateDocument(documentType, `${document._id}`, body)
          },
          delete: async () => {
            await deleteDocument(documentType, `${document._id}`)
          },
        })

        resolve((options?.method === `findOne`
          ? assign(documents[0])
          : {
              documents: documents.map(assign),
              total: total[0]?.total ?? 0,
            }) as DocumentQueryResult<D, M>)
      } catch (err) {
        reject(err)
      }
    },
  }

  return query
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
  document.set(body)
  await document.save()

  return [original, document.toJSON()] as [D, D]
}

async function deleteDocument(Model: DocumentModel<any>, id: string) {
  const document = await findDocumentByID(Model, id)
  await document?.deleteOne()
}
