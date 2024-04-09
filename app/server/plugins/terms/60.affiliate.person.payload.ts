import { type Image } from "@unb-libraries/nuxt-layer-entity"
import { Pronouns, Status, Title } from "~/types/affiliate"

const pluginOptions = { enable: (body: any) => matchInputType(body, `person`) }

export default defineMongooseReader(Affiliate.Person, async (payload, options) => {
  const create = options?.op === `create`
  const { status } = await validateBody(payload, {
    status: optional(EnumValidator(Status)),
  })
  const migrate = create && status === Status.MIGRATED

  const { image, phone, ...body } = await validateBody(payload, {
    firstName: requireIf(create, StringValidator),
    lastName: requireIf(create, StringValidator),
    pronouns: requireIf(create, EnumValidator(Pronouns)),
    title: optional(EnumValidator(Title)),
    occupation: requireIf(!migrate, StringValidator),
    position: requireIf(!migrate, StringValidator),
    image: optional(URIEntityTypeValidator<Image>(`Image`)),
    bio: optional(StringValidator),
    email: requireIf(!migrate, MatchValidator(/^.+@.+\..+$/)),
    phone: requireIf(!migrate, MatchValidator(/^\+?[\d\s\-()]+$/)),
    web: optional(ArrayValidator(MatchValidator(/^(http|https):\/\/[^ "]+$/))),
    active: optional(BooleanValidator),
  })

  return {
    ...body,
    image: image?.id,
    phone: phone?.replace(/[^\d+]/g, ``),
    status,
    type: Affiliate.Person.fullName,
  }
}, pluginOptions)
