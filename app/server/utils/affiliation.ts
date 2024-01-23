import type { Person } from "~/types/affiliation"

export const readPersonBody = defineEntityBodyReader<Person>(async (body) => {
  const { image: imageURI } = body
  if (imageURI) {
    const image = await ImageFile.findByURI(imageURI)
    if (image) {
      body.image = image
    } else {
      delete body.image
    }
  }

  return body
})
