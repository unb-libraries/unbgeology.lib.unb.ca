import { EntityFieldTypes } from "layers/mongo/types/entity"
import { type File as FileEntity, type Entity, FileState } from "@unb-libraries/nuxt-layer-entity"
import { Stateful } from "../utils/mixins"
import { type DocumentBase as Base } from "../../types/schema"

export interface File extends Omit<FileEntity, keyof Entity | `uri`>, Base {
  filepath: string
  uploadName: string
}

interface MimetypedOptions {
  accept?: string[]
}

export const Mimetyped = defineDocumentSchema<Pick<FileEntity, `mimetype`>, MimetypedOptions>(options => ({
  mimetype: {
    type: EntityFieldTypes.String,
    required: true,
    enum: options.accept,
  },
}))

export default defineDocumentModel<File>(`File`, defineDocumentSchema<File>({
  filename: {
    type: EntityFieldTypes.String,
    required: true,
    default() {
      return this.filepath.split(`/`).at(-1)
    },
  },
  filepath: {
    type: EntityFieldTypes.String,
    required: true,
  },
  filesize: {
    type: EntityFieldTypes.Number,
    required: true,
  },
  uploadName: {
    type: EntityFieldTypes.String,
    required: true,
  },
}).mixin(Mimetyped({}))
  .mixin(Stateful<typeof FileState>({
    values: FileState,
    default: FileState.PENDING,
  }))
  .mixin(DocumentBase())())
