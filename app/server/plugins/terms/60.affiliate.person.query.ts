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
    default: false,
    filter: String,
  },
  position: {
    default: false,
    filter: String,
  },
  image: {
    default: false,
    sort: false,
    filter: false,
  },
  bio: {
    default: false,
    sort: false,
    filter: false,
  },
  email: {
    default: false,
    filter: false,
  },
  phone: {
    default: false,
    filter: String,
  },
  web: {
    default: false,
    filter: false,
  },
  status: {
    default: false,
    filter: Enum(Status),
  },
  type: {
    default: false,
    filter: (field, [op, value]) => (query) => {
      if ((Array.isArray(value) && value.includes(`person`)) || value === `person`) {
        return String(field, [op, Affiliate.Person.fullName])(query)
      }
    },
  },
  active: {
    default: false,
    filter: Boolean,
  },
  created: {
    default: false,
    filter: Date,
  },
  updated: {
    default: false,
    filter: Date,
  },
}))
