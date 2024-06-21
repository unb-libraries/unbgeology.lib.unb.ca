import { Boolean, Enum, Numeric, ObjectID, String } from "~/layers/mongo/server/utils/api/filter"
import { Division, Status } from "~/types/geochronology"

export default defineMongooseEventQueryHandler(Geochronology, defineEventQuery({
  parent: {
    default: true,
    sort: `__l`,
    filter: false,
    definition: {
      id: {
        default: true,
        sort: false,
        filter: ObjectID,
      },
      label: {
        default: true,
        filter: String,
      },
    },
  },
  division: {
    default: true,
    filter: Enum(Division),
  },
  start: {
    default: true,
    filter: Numeric,
  },
  gssp: {
    default: true,
    filter: Boolean,
  },
  uncertainty: {
    default: true,
    filter: Numeric,
  },
  color: {
    default: true,
    filter: String,
  },
  status: {
    default: true,
    filter: Enum(Status),
  },
  type: {
    default: false,
    filter: (field, [op, value]) => (query) => {
      if ((Array.isArray(value) && value.includes(`geochronology`)) || value === `geochronology`) {
        return String(field, [op, Geochronology.fullName])(query)
      }
    },
  },
}))
