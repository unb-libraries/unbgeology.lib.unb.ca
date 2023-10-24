import { type Entity, EntityFieldTypes } from "~/layers/mongo/types/entity"

export interface File extends Entity {
  filename: string
  filepath: string
  filesize: number
  filetype: string
  persisted: boolean
  uploadName: string
}

export const File = defineEntityType<File>(`File`, {
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
    default: function (this: File) {
      return this.filename
    },
  },
})

export interface Image extends File {
  alt: string
  dimensions: {
    width: number
    height: number
  }
  title: string
}

export const Image = defineEntityBundle<File, Image>(File, `Image`, {
  alt: {
    type: EntityFieldTypes.String,
    required: false,
  },
  title: {
    type: EntityFieldTypes.String,
    required: false,
  },
})

export interface Document extends File {
}

export const Document = defineEntityBundle<File, Document>(File, `Document`, {
})
