import { Status } from "~/types/classification"

export default defineMongooseFormatter(Classification.Rock, (doc) => {
  const { status, type } = doc
  return {
    status: status && useEnum(Status).valueOf(status),
    type: type && `classification/rock`,
  }
}, {
  enable: doc => matchInputType(doc, Classification.Rock.fullName, {
    typeField: `__type`,
  }),
})
