import { Division, Status } from "~/types/geochronology"

export default defineMongooseReader(Geochronology, async (payload, options) => {
  if (options.op === `create` && payload.type !== `geochronology`) { return {} }

  const create = options.op === `create`
  const { parent, division, status, ...body } = await validateBody(payload, {
    // FIX: Work around as URIEntityTypeValidator cannot authorize against the API
    parent: optional(MatchValidator(/^\/api\/terms\/[a-z0-9]{24}$/)),
    division: requireIf(create, EnumValidator(Division)),
    boundaries: requireIf(create, ObjectValidator({
      lower: requireIf(create, NumberValidator),
      upper: requireIf(create, NumberValidator),
    })),
    gssp: optional(BooleanValidator),
    uncertainty: optional(NumberValidator),
    color: optional(StringValidator),
    status: optional(EnumValidator(Status)),
  })

  return {
    ...body,
    parent: parent && { _id: parent.substring(1).split(`/`).at(-1)! },
    division: division && useEnum(Division).valueOf(division),
    status: status && useEnum(Status).valueOf(status),
    type: Geochronology.fullName,
  }
})
