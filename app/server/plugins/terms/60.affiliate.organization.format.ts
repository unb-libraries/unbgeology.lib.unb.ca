import { Status } from "~/types/affiliate"

export default defineMongooseFormatter(Affiliate.Organization, (doc) => {
  if (doc.__type !== Affiliate.Organization.fullName) { return }

  const { address, contact, web, status, type } = doc
  return {
    address,
    contact,
    web,
    status: status && useEnum(Status).valueOf(status),
    type: type && `organization`,
  }
})
