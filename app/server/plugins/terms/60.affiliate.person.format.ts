import { Pronouns, Title } from "~/types/affiliate"

export default defineMongooseFormatter(Affiliate.Person, (doc) => {
  const { firstName, lastName, pronouns, title, occupation, position, image, bio, email, phone, type } = doc

  return {
    firstName,
    lastName,
    pronouns: pronouns
      ? useEnum(Pronouns).labelOf(pronouns).toLowerCase()
      : undefined,
    title: title && title !== Title.NONE
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
    type: type
      ? `person`
      : undefined,
  }
})
