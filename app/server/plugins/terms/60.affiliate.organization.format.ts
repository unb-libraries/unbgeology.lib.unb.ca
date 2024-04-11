import { Status } from "~/types/affiliate"

export default defineMongooseFormatter(Affiliate.Organization, (doc) => {
  const { address, contact, status, type } = doc
  return {
    address,
    contact,
    status: status && useEnum(Status).valueOf(status),
    type: type && `organization`,
  }
}, {
  enable: (doc: any) => matchInputType(doc, Affiliate.Organization.fullName, { typeField: `__type` }),
})
