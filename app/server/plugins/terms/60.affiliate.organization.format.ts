import { Status } from "~/types/affiliate"

export default defineMongooseFormatter(Affiliate.Organization, (doc) => {
  if (doc.__type !== Affiliate.Organization.fullName) { return }

  const { address, contact, status, type } = doc
  return {
    address,
    contact,
    status: status && useEnum(Status).valueOf(status),
    type: type && `organization`,
  }
})
