import { Status } from "~/types/portion"

export default defineMongooseFormatter(FossilPortion, (doc) => {
  const { status, type } = doc
  return {
    status: status && useEnum(Status).valueOf(status),
    type: type && `portion`,
  }
})
