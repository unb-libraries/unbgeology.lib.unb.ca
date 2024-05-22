import { Boolean, Date, String } from "../../utils/api/filter"

export default defineMongooseEventQueryHandler(User, defineEventQuery({
  id: {
    default: true,
    select: `username`,
    sort: `username`,
    filter: (_, condition) => String(`username`, condition),
  },
  active: {
    default: false,
    filter: Boolean,
  },
  profile: {
    default: false,
    filter: false,
    definition: {
      firstName: {
        default: false,
        filter: String,
      },
      lastName: {
        default: false,
        filter: String,
      },
      email: {
        default: false,
        filter: String,
      },
      phone: {
        default: false,
        filter: String,
      },
    },
  },
  roles: {
    default: true,
    filter: String,
  },
  permissions: {
    default: false,
    filter: false,
  },
  created: {
    default: true,
    filter: Date,
  },
  updated: {
    default: true,
    filter: Date,
  },
}))
