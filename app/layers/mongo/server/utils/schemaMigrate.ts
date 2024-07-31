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

export function defineDocumentSchemaMigration<T extends DocumentBase>(Model: DocumentModel<T>, version: number, handler: DocumentSchemaMigrationHandler<T>, options?: Partial<DocumentSchemaMigrationOptions>) {
  options = { setSchemaVersion: true, ...options ?? {} }
  return defineNitroPlugin((nitro) => {
    nitro.hooks.hook(`mongoose:schema:update`, async (collection) => {
      if (Model.mongoose.model.collection.collectionName === collection) {
        const filter = { $or: [{ schemaVersion: { $exists: false } }, { schemaVersion: { $lt: version } }] }
        if (await Model.mongoose.model.countDocuments(filter) === 0) {
          return
        }

        consola.info(`Migrating ${Model.fullName} schema to version ${version}...`)
        await handler({
          find() {
            return Model.mongoose.model
              .find(filter)
          },
          aggregate() {
            return Model.mongoose.model
              .aggregate()
              .match(filter)
          },
          updateMany(update, options) {
            return Model.mongoose.model
              .updateMany(filter, update, options)
          },
          deleteMany() {
            return Model.mongoose.model
              .deleteMany(filter)
          },
        })
        if (options.setSchemaVersion) {
          const { modifiedCount } = await Model.mongoose.model
            .updateMany(filter, { schemaVersion: version })
          consola.info(`${modifiedCount} documents updated.`)
        }
      }
    })
  })
}
