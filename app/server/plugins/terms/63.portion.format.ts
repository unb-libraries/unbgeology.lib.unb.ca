import { Status } from "~/types/portion"

export default defineMongooseFormatter(FossilPortion, (doc) => {
  if (doc.__type !== FossilPortion.fullName) { return }

  const { status, type } = doc
  return {
    status: status && useEnum(Status).valueOf(status),
    type: type && `portion`,
  }
})
