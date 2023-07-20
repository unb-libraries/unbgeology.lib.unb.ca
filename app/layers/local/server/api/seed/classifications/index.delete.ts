import Classification from "~/server/entityTypes/Classification"

export default defineEventHandler(async (event) => {
  await Classification.deleteMany()
  setResponseStatus(event, 204, `Classification objects unseeded.`)
  return null
})
