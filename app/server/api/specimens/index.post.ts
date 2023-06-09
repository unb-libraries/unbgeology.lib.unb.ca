import { type Specimen } from "~~/types/specimen"

export default defineEventHandler(async (event) => {
  const storage = useStorage(`db`)

  const {
    name,
    id,
    description,
    age,
    composition,
    dimension,
    partial,
    pieces,
  } = await readBody(event)

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: `Missing parameter "id" is required.` })
  } else if (!name) {
    throw createError({ statusCode: 400, statusMessage: `Missing parameter "name" is required.` })
  }

  const now = new Date().valueOf()
  const specimen: Specimen = {
    name,
    id,
    description,
    age,
    composition,
    dimension,
    partial,
    pieces,
    status: `draft`,
    created: now,
    modified: now,
  }

  const specimens = await storage.getItem(`specimens`) || []
  specimens.push(specimen)
  await storage.setItem(`specimens`, specimens)

  setResponseStatus(event, 201)
  return specimen
})
