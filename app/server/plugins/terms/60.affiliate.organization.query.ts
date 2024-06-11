import { String, Enum } from "~/layers/mongo/server/utils/api/filter"
import { Status } from "~/types/affiliate"

export default defineMongooseEventQueryHandler(Affiliate.Organization, defineEventQuery({
  address: {
    default: true,
    sort: false,
    filter: false,
    definition: {
      line1: {
        default: true,
        filter: false,
      },
      line2: {
        default: true,
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
  },
  contact: {
    default: true,
    sort: false,
    filter: false,
    definition: {
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
  },
  web: {
    default: true,
    sort: false,
    filter: false,
  },
  status: {
    default: true,
    filter: Enum(Status),
  },
  type: {
    default: true,
    // FIX: Allow filtering on more than one type
    filter: (field, [op, value]) => (query) => {
      if ((Array.isArray(value) && value.includes(`affiliate/organization`)) || value === `affiliate/organization`) {
        return String(field, [op, Affiliate.Organization.fullName])(query)
      }
    },
  },
}))
