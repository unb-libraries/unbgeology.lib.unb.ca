import { type Entity, type Image as ImageEntity } from "@unb-libraries/nuxt-layer-entity"
import { EntityFieldTypes } from "../../types/entity"
import FileBase, { type File, Mimetyped } from "./FileBase"

export interface Image extends Omit<ImageEntity, keyof Entity>, File {}

const Schema = defineDocumentSchema
  .mixin(Mimetyped({ accept: [`image/jpeg`] }))

export default defineDocumentModel<File, Image>(`Image`, Schema<Image>({
  alt: {
    type: EntityFieldTypes.String,
    required: false,
    default: `untitle`,
  },
  title: {
    type: EntityFieldTypes.String,
    required: false,
  },
})(), FileBase)
