import { FileState } from "@unb-libraries/nuxt-layer-entity"
import { File } from "../../documentTypes/FileBase"
import { EnumValidator as Enum, NumberValidator as Number, requireIf, StringValidator as String } from "../../utils/api/payload"

export default defineBodyReader<File>(FileBase, async (body, options) => {
  const create = options?.op === `create`
  const { status, ...validatedBody } = await validateBody(body, {
    filename: requireIf(create, String),
    filepath: requireIf(create, String),
    filesize: requireIf(create, Number),
    mimetype: requireIf(create, String),
    uploadName: requireIf(create, String),
    status: optional(Enum(FileState)),
  })

  return {
    ...validatedBody,
    status: status ? useEnum(FileState).valueOf(status) : undefined,
  }
})
