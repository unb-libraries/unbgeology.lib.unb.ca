import { Boolean, Enum, Numeric, String } from "~/layers/mongo/server/utils/api/filter"
import { Division } from "~/types/geochronology"

export default defineMongooseEventQueryHandler(Geochronology, defineEventQuery({
  division: {
    default: false,
    filter: Enum(Division),
  },
  boundaries: {
    default: false,
    sort: `boundaries.upper`,
    filter: false,
    definition: {
      lower: {
        default: true,
        filter: Numeric,
      },
      upper: {
        default: true,
        filter: Numeric,
      },
    },
  },
  gssp: {
    default: false,
    filter: Boolean,
  },
  uncertainty: {
    default: false,
    filter: Numeric,
  },
  color: {
    default: false,
    filter: String,
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
