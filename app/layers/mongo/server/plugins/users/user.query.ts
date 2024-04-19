import { Boolean, Date, String } from "../../utils/api/filter"

export default defineMongooseEventQueryHandler(User, defineEventQuery({
  id: {
    default: true,
    select: `username`,
    filter: (_, condition) => String(`username`, condition),
  },
  username: {
    default: true,
    filter: String,
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
  created: {
    default: true,
    filter: Date,
  },
  updated: {
    default: true,
    filter: Date,
  },
}))
