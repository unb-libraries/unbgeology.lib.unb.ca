import { EntityFieldTypes, type EntityDocument } from "layers/mongo/types/entity"
import { type File as IFile, type Image as IImage, type Document as IDocument } from "layers/base/types/entity"

type FileDocument = EntityDocument<IFile>
type ImageDocument = EntityDocument<IImage>
type DocumentDocument = EntityDocument<IDocument>

export const File = defineEntityType<FileDocument>(`File`, {
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
    enum: [`jpg`, `jpeg`, `png`, `pdf`],
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
})

export const Image = defineEntityBundle<FileDocument, ImageDocument>(File, `Image`, {
  alt: {
    type: EntityFieldTypes.String,
    required: false,
  },
  title: {
    type: EntityFieldTypes.String,
    required: false,
  },
})

export const Document = defineEntityBundle<FileDocument, DocumentDocument>(File, `Document`, {
})
