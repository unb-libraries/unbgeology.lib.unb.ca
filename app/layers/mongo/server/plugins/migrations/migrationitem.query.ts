import { MigrationItemStatus } from "@unb-libraries/nuxt-layer-entity"
import { Date, Enum, String } from "../../utils/api/filter"

export default defineMongooseEventQueryHandler(MigrationItem, defineEventQuery({
  id: {
    default: true,
    select: `sourceID`,
    filter: (_, condition) => String(`sourceID`, condition),
  },
  data: {
    default: false,
    sort: false,
    filter: false,
  },
  status: {
    default: true,
    filter: Enum(MigrationItemStatus),
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
