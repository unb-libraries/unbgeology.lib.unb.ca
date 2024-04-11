import { Division } from "~/types/geochronology"

export default defineMongooseReader(Geochronology, async (payload, options) => {
  if (options.op === `create` && payload.type !== `geochronology`) { return {} }

  const create = options.op === `create`
  const { division, ...body } = await validateBody(payload, {
    division: requireIf(create, EnumValidator(Division)),
    boundaries: requireIf(create, ObjectValidator({
      lower: requireIf(create, NumberValidator),
      upper: requireIf(create, NumberValidator),
    })),
    gssp: optional(BooleanValidator),
    uncertainty: optional(NumberValidator),
    color: optional(StringValidator),
  })

  return {
    ...body,
    division: division && useEnum(Division).valueOf(division),
    type: Geochronology.fullName,
  }
})
