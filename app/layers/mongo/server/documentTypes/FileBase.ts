import { EntityFieldTypes } from "layers/mongo/types/entity"
import { encode } from "ufo"
import { Stateful } from "../utils/mixins"
import { type File as FileEntity, type Entity, FileState } from "@unb-libraries/nuxt-layer-entity"
import type { DocumentBase as Base } from "../../types/schema"
import type { Authorize as IAuthorize } from "../utils/mixins/Authorize"

export interface File extends Omit<FileEntity, keyof Entity | `uri`>, IAuthorize, Base {
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

export function renderFile(doc: File, ret: File) {
  const { filename, filesize, mimetype } = ret
  return {
    ...renderDocumentBase(doc),
    self: `/api/files/${doc._id}`,
    uri: encode(`/upload/${filename}`),
    filename,
    filesize,
    mimetype,
    type: `other`,
  }
}

export default defineDocumentModel<File>(`File`, defineDocumentSchema<File>({
  filename: {
    type: EntityFieldTypes.String,
    required: true,
    unique: true,
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
}, {
  alterSchema: (schema) => {
    schema.index({ filename: 1, uploadName: 1 })
    schema.index({ filename: `text`, uploadName: `text` }, { name: `full_text_search` })
    schema.set(`toJSON`, {
      transform: renderFile,
    })
  },
}).mixin(Mimetyped({}))
  .mixin(Stateful<typeof FileState>({
    values: FileState,
    default: FileState.PENDING,
  }))
  .mixin(DocumentBase())())
