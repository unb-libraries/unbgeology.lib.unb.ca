import { Status } from "~/types/specimen"

export default defineMongooseReader(Specimen.Fossil, async (payload, options) => {
  const create = options.op === `create`
  if (create && payload.type !== `mineral`) { return {} }

  const { status } = await validateBody(payload, {
    status: optional(EnumValidator(Status)),
  })

  const migrate = status === Status.MIGRATED
  const draft = !status || status === Status.DRAFT

  const { classification, type } = await validateBody(payload, {
    classification: requireIf(create && !(migrate || draft), MatchValidator(/^\/api\/terms\/[a-z0-9]{24}$/)),
    type: requireIf(create, MatchValidator(/^mineral$/)),
  })

  return {
    classification: classification && { _id: classification.split(`/`).at(-1) },
    classificationModel: classification && Classification.Mineral.mongoose.model.modelName,
    type: type && Specimen.Mineral.mongoose.model.modelName,
  }
})
