import { Image as ImageEntity } from "layers/mongo/server/entityTypes/File"
import { type Specimen } from "types/specimen"

export default defineEventHandler(async (event) => {
  const {
    classifications: classificationURIs,
    images: imageURIs,
    editor: userURI,
    ...body
  } = await readBody(event)

  if (classificationURIs) {
    body.classifications = await Classification.findManyByURI(classificationURIs)
  }
  if (imageURIs) {
    body.images = await ImageEntity.findManyByURI(imageURIs)
  }
  if (userURI) {
    body.editor = await User.findByURI(userURI)
  }

  const specimen = await Specimen.create(body)
  return sendEntity<Specimen>(event, specimen)
})
