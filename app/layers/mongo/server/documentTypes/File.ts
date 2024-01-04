import { EntityFieldTypes, type EntityDocument } from "layers/mongo/types/entity"
import { type File as IFile, type Image as IImage, type Document as IDocument } from "@unb-libraries/nuxt-layer-entity"

type FileDocument = EntityDocument<IFile>
type ImageDocument = EntityDocument<IImage>
type DocumentDocument = EntityDocument<IDocument>

export const FileBase = defineDocumentType<FileDocument>(`File`, {
  filename: {
    type: EntityFieldTypes.String,
    required: true,
  },
  filepath: {
    type: EntityFieldTypes.String,
    required: true,
  },
  filesize: {
    type: EntityFieldTypes.Number,
    required: true,
  },
  filetype: {
    type: EntityFieldTypes.String,
    required: true,
    enum: [`jpg`, `jpeg`, `png`, `pdf`, `json`],
  },
  persisted: {
    type: EntityFieldTypes.Boolean,
    required: true,
    default: false,
  },
  uploadName: {
    type: EntityFieldTypes.String,
    required: false,
    default: function (this: FileDocument) {
      return this.filename
    },
  },
}, {
  virtuals: {
    uri: {
      get() {
        return `/api/files/${this.type ?? `other`}/${this.pk}`
      },
    },
  },
  toJSON: {
    transform(doc, ret) {
      ret.type = doc.type
      return ret
    },
  },
})

export const ImageFile = defineDocumentBundle<FileDocument, ImageDocument>(FileBase, `Image`, {
  alt: {
    type: EntityFieldTypes.String,
    required: false,
  },
  title: {
    type: EntityFieldTypes.String,
    required: false,
  },
})

export const DocumentFile = defineDocumentBundle<FileDocument, DocumentDocument>(FileBase, `Document`, {
})
