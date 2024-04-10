import { Pronouns, Title } from "~/types/affiliate"

export default defineMongooseFormatter(Affiliate.Person, (doc) => {
  const { firstName, lastName, pronouns, title, occupation, position, image, bio, email, phone, web, active, type } = doc

  return {
    firstName,
    lastName,
    pronouns: pronouns
      ? useEnum(Pronouns).labelOf(pronouns).toLowerCase()
      : undefined,
    title: title
      ? useEnum(Title).labelOf(title).toLowerCase()
      : undefined,
    occupation,
    position,
    image: image
      ? `${image}`
      : undefined,
    bio,
    email,
    phone,
    web,
    active: active !== undefined
      ? active
      : undefined,
    type: type
      ? `person`
      : undefined,
  }
})
