import { consola } from "consola"
import type { DocumentBase, DocumentModel } from "../../types/schema"

type DocumentSchemaMigrationHandler<T extends DocumentBase> = (Migration: {
  find: () => ReturnType<DocumentModel<T>[`mongoose`][`model`][`find`]>
  aggregate: () => ReturnType<DocumentModel<T>[`mongoose`][`model`][`aggregate`]>
  updateMany: (update: Parameters<DocumentModel<T>[`mongoose`][`model`][`updateMany`]>[1], options?: Parameters<DocumentModel<T>[`mongoose`][`model`][`updateMany`]>[2]) => ReturnType<DocumentModel<T>[`mongoose`][`model`][`updateMany`]>
  deleteMany: () => ReturnType<DocumentModel<T>[`mongoose`][`model`][`deleteMany`]>
}) => void | Promise<void>

interface DocumentSchemaMigrationOptions {
  setSchemaVersion: boolean
}

export function defineDocumentSchemaMigration<T extends DocumentBase>(DocumentType: DocumentModel<T>, version: number, handler: DocumentSchemaMigrationHandler<T>, options?: Partial<DocumentSchemaMigrationOptions>) {
  options = { setSchemaVersion: true, ...options ?? {} }
  return defineNitroPlugin((nitro) => {
    nitro.hooks.hook(`mongoose:schema:update`, async (Model) => {
      if (DocumentType.mongoose.model.modelName === Model.modelName) {
        const filter = { $or: [{ schemaVersion: { $exists: false } }, { schemaVersion: { $lt: version } }] }
        if (await DocumentType.mongoose.model.countDocuments(filter) === 0) {
          return
        }

        consola.info(`Migrating ${DocumentType.fullName} schema to version ${version}...`)
        await handler({
          find() {
            return DocumentType.mongoose.model
              .find<T>(filter)
          },
          aggregate() {
            return DocumentType.mongoose.model
              .aggregate<T>()
              .match(filter)
          },
          updateMany(update, options) {
            return DocumentType.mongoose.model
              .updateMany<T>(filter, update, options)
          },
          deleteMany() {
            return DocumentType.mongoose.model
              .deleteMany(filter)
          },
        })
        if (options.setSchemaVersion) {
          const { modifiedCount } = await DocumentType.mongoose.model
            .updateMany(filter, { schemaVersion: version })
          consola.info(`${modifiedCount} documents updated.`)
        }
      }
    })
  })
}
