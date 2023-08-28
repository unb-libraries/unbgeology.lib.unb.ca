import Building, { IBuilding } from "~~/server/entityTypes/Building"

export default defineEventHandler(async (event) => {
  const { path } = event

  const docs = await Building
    .find()
    .select(`-_id -__v -rooms`)

  return docs
    .map((doc: IBuilding) => doc.toJSON())
    .map((doc: IBuilding) => ({
      self: `${path}/${doc.slug}`,
      ...doc,
      rooms: {
        self: `${path}/${doc.slug}/rooms`,
      },
      created: new Date(doc.created),
      updated: new Date(doc.updated),
    }))
})
