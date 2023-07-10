import Specimen from "entity-types/Specimen"
import type { Specimen as ISpecimen } from "entity-types/Specimen"

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<ISpecimen>>(event)
  const count = await Specimen.estimatedDocumentCount()
  body.objectId = `UNB-${`${count + 1}`.padStart(3, `0`)}`

  try {
    await Specimen.create(body)
    setResponseStatus(event, 201, `Created specimen object.`)
    return await Specimen
      .findOne({ objectId: body.objectId })
      .select({ __v: false, _id: false })
      .exec()
  } catch (err: any) {
    // Duplicate key
    if (err.code && err.code === 11000) {
      const [field, value] = Object.entries(err.keyValue)[0]
      throw createError({ statusCode: 400, statusMessage: `Specimen object with ${field} "${value}" already exists.` })
    }

    // Missing parameters
    if (err.errors) {
      type ValidationError = {kind: string, path: string}
      const fields = Object
        .values<ValidationError>(err.errors)
        .reduce((fields: string[], e) => e.kind === `required` ? [...fields, e.path] : fields, [])
      throw createError({ statusCode: 400, statusMessage: `Missing fields ${fields.join(`, `)} are required.` })
    }

    console.error(err)
    throw createError({ statusCode: 500, statusMessage: `Unexpected server error.` })
  }
})
