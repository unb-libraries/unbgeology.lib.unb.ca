import StorageUnit from "entity-types/StorageUnit"

export default defineEventHandler(async (event) => {
  const { path } = event

  const docs = await StorageUnit
    .find()
    .select(`-_id -__v`)

  return docs
    .map(doc => doc.toJSON())
    .map(doc => ({
      self: path,
      ...doc,
      created: new Date(doc.created),
      updated: new Date(doc.updated),
    }))
})
