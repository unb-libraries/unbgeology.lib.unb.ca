import { type Image } from "@unb-libraries/nuxt-layer-entity"
import { Pronouns, Status, Title } from "~/types/affiliate"

export default defineMongooseReader(Affiliate.Person, async (payload, options) => {
  if (options.op === `create` && payload.type !== `affiliate/person`) { return {} }

  const create = options.op === `create`
  const { status } = await validateBody(payload, {
    status: optional(EnumValidator(Status)),
  })
  const migrate = status === Status.MIGRATED

  const { image, phone, ...body } = await validateBody(payload, {
    firstName: requireIf(create, StringValidator),
    lastName: requireIf(create, StringValidator),
    pronouns: requireIf(create, EnumValidator(Pronouns)),
    title: optional(EnumValidator(Title)),
    occupation: requireIf(create && !migrate, StringValidator),
    position: requireIf(create && !migrate, StringValidator),
    image: optional(URIEntityTypeValidator<Image>(`Image`)),
    bio: optional(StringValidator),
    email: requireIf(create && !migrate, MatchValidator(/^.+@.+\..+$/)),
    phone: requireIf(create && !migrate, MatchValidator(/^\+?[\d\s\-()]+$/)),
    web: optional(ArrayValidator(MatchValidator(/^(http|https):\/\/[^ "]+$/))),
    active: optional(BooleanValidator),
  })

  return {
    ...body,
    image: image?.id,
    phone: phone?.replace(/[^\d+]/g, ``),
    status: status && useEnum(Status).valueOf(status),
    type: Affiliate.Person.fullName,
  }
}, {
  enable: (body: any, { op }) => op === `update` || matchInputType(body, `person`),
})
