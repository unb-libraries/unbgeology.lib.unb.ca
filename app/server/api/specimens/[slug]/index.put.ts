import { Image as ImageEntity } from "layers/mongo/server/entityTypes/File"
import { type Specimen } from "types/specimen"

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const { select } = getQueryOptions(event)

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

  const specimen = await Specimen.findOneAndUpdate({ slug }, body, { new: true })
    .populate(`classifications`, `_id`)
    .populate(`images`, `_id`)
    .select(getSelectedFields(select))

  return sendEntityOr404<Specimen>(event, specimen)
})
