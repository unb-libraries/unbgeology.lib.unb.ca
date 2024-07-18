import { Pronouns, Status, Title } from "~/types/affiliate"

export default defineMongooseReader(Affiliate.Person, async (payload, options) => {
  if (options.op === `create` && payload.type !== `affiliate/person`) { return {} }

  const create = options.op === `create`
  const { status } = await validateBody(payload, {
    status: optional(EnumValidator(Status)),
  })

  const { phone, ...body } = await validateBody(payload, {
    firstName: optional(StringValidator),
    lastName: optional(StringValidator),
    pronouns: optional(EnumValidator(Pronouns)),
    title: optional(EnumValidator(Title)),
    occupation: optional(StringValidator),
    position: optional(StringValidator),
    image: optional(MatchValidator(/^\/api\/files\/[a-z0-9]{24}$/)),
    bio: optional(StringValidator),
    email: optional(MatchValidator(/^.+@.+\..+$/)),
    phone: optional(MatchValidator(/^\+?[\d\s\-()]+$/)),
    web: optional(ArrayValidator(MatchValidator(/^(http|https):\/\/[^ "]+$/))),
    active: optional(BooleanValidator),
  })

  return {
    ...body,
    phone: phone && phone.replace(/[^\d+]/g, ``),
    status: status && useEnum(Status).valueOf(status),
    type: Affiliate.Person.fullName,
  }
})
