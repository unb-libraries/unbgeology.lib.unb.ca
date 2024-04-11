import { Pronouns, Status, Title } from "~/types/affiliate"

export default defineMongooseFormatter(Affiliate.Person, (doc) => {
  const { firstName, lastName, pronouns, title, occupation, position, image, bio, email, phone, web, active, status, type } = doc

  return {
    firstName,
    lastName,
    pronouns: pronouns && useEnum(Pronouns).labelOf(pronouns).toLowerCase(),
    title: title && useEnum(Title).labelOf(title).toLowerCase(),
    occupation,
    position,
    image: image && `${image}`,
    bio,
    email,
    phone,
    web,
    active: active !== undefined && active,
    status: status && useEnum(Status).valueOf(status),
    type: type && `person`,
  }
}, {
  enable: (doc: any) => matchInputType(doc, Affiliate.Person.fullName, { typeField: `__type` }),
})
