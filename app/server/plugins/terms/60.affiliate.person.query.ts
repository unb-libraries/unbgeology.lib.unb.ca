import { Boolean, Date, Enum, String } from "~/layers/mongo/server/utils/api/filter"
import { Pronouns, Status, Title } from "~/types/affiliate"

export default defineMongooseEventQueryHandler(Affiliate.Person, defineEventQuery({
  firstName: {
    default: true,
    filter: String,
  },
  lastName: {
    default: true,
    filter: String,
  },
  pronouns: {
    default: true,
    filter: Enum(Pronouns),
  },
  title: {
    default: true,
    filter: Enum(Title),
  },
  occupation: {
    default: true,
    filter: String,
  },
  position: {
    default: true,
    filter: String,
  },
  image: {
    default: true,
    sort: false,
    filter: false,
  },
  bio: {
    default: true,
    sort: false,
    filter: false,
  },
  email: {
    default: true,
    filter: false,
  },
  phone: {
    default: true,
    filter: String,
  },
  web: {
    default: true,
    filter: false,
  },
  status: {
    default: true,
    filter: Enum(Status),
  },
  type: {
    default: true,
    filter: (field, [op, value]) => (query) => {
      if ((Array.isArray(value) && value.includes(`affiliate/person`)) || value === `affiliate/person`) {
        return String(field, [op, Affiliate.Person.fullName])(query)
      }
    },
  },
  active: {
    default: true,
    filter: Boolean,
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
