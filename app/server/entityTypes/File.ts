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

