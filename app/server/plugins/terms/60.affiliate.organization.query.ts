import { String } from "~/layers/mongo/server/utils/api/filter"

export default defineMongooseEventQueryHandler(Affiliate.Organization, defineEventQuery({
  address: {
    line1: {
      default: true,
      filter: false,
    },
    line2: {
      default: false,
      sort: false,
      filter: false,
    },
    city: {
      default: true,
      sort: false,
      filter: false,
    },
    state: {
      default: true,
      filter: String,
    },
    postalCode: {
      default: true,
      filter: String,
    },
    country: {
      default: true,
      filter: String,
    },
  },
  contact: {
    name: {
      default: true,
      filter: String,
    },
    email: {
      default: true,
      filter: String,
    },
    phone: {
      default: true,
      filter: String,
    },
  },
  web: {
    default: false,
    sort: false,
    filter: false,
  },
  type: {
    default: false,
    filter: (field, [op, value]) => (query) => {
      if ((Array.isArray(value) && value.includes(`organization`)) || value === `organization`) {
        return String(field, [op, Affiliate.Organization.fullName])(query)
      }
    },
  },
}))
