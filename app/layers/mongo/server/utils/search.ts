import { type CreateIndexesOptions } from "mongodb"
import type { IndexDirection } from "mongoose"

export async function createSearchIndex(Model: ReturnType<typeof defineDocumentModel<any>>, fields: Record<string, number>, options?: { filter: CreateIndexesOptions[`partialFilterExpression`]}) {
  const collectionName = Model.mongoose.model.collection.collectionName

  const index = Object.keys(fields).map(field => ({ [field]: `text` })).reduce((index, field) => ({ ...index, ...field }), {}) as Record<string, IndexDirection>
  const weights = Object.entries(fields).map(([field, weight]) => ({ [field]: weight })).reduce((weights, field) => ({ ...weights, ...field }), {})
  const indexName = `full_text_search`

  const indexOptions: CreateIndexesOptions = {
    background: true,
    name: indexName,
    weights,
  }
  if (options?.filter) {
    indexOptions.partialFilterExpression = options.filter
  }

  const create = async () => await Model.mongoose.model.db
    .collection(collectionName)
    .createIndex(index, indexOptions)

  try {
    await create()
  } catch (err: any) {
    const { codeName } = err
    if (codeName === `IndexOptionsConflict`) {
      await Model.mongoose.model.db.collection(collectionName).dropIndex(indexName)
      await create()
    } else {
      throw err
    }
  }
}
