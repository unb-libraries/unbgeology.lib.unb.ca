import { Status } from "~/types/specimen"

export default defineMongooseReader(Specimen.Fossil, async (payload, options) => {
  const create = options.op === `create`
  if (create && payload.type !== `fossil`) { return {} }

  const { status } = await validateBody(payload, {
    status: optional(EnumValidator(Status)),
  })

  const migrate = status === Status.MIGRATED
  const draft = !status || status === Status.DRAFT

  const { classification, portion, type } = await validateBody(payload, {
    classification: requireIf(create && !(migrate || draft), MatchValidator(/^\/api\/terms\/[a-z0-9]{24}$/)),
    portion: optional(URIEntityTypeValidator(`portion`)),
    type: requireIf(create, MatchValidator(/^fossil$/)),
  })

  return {
    classification: classification && { _id: classification.split(`/`).at(-1) },
    classificationModel: classification && Classification.Fossil.mongoose.model.modelName,
    portion: portion && { _id: portion.id },
    type: type && Specimen.Fossil.mongoose.model.modelName,
  }
})
