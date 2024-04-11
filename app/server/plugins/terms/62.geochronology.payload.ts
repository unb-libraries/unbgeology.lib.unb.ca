import { Division, Status } from "~/types/geochronology"

export default defineMongooseReader(Geochronology, async (payload, options) => {
  if (options.op === `create` && payload.type !== `geochronology`) { return {} }

  const create = options.op === `create`
  const { division, status, ...body } = await validateBody(payload, {
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
    division: division && useEnum(Division).valueOf(division),
    status: status && useEnum(Status).valueOf(status),
    type: Geochronology.fullName,
  }
})
