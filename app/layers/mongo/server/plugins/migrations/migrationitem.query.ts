import { MigrationItemStatus } from "@unb-libraries/nuxt-layer-entity"
import { Date, Enum, Numeric, ObjectID, String } from "../../utils/api/filter"

export default defineMongooseEventQueryHandler(MigrationItem, defineEventQuery({
  id: {
    default: true,
    select: `sourceID`,
    sort: `sourceID`,
    filter: (_, condition) => Numeric(`sourceID`, condition),
  },
  migration: {
    default: false,
    join: Migration,
    filter: ObjectID,
    definition: {
      id: {
        default: true,
        filter: ObjectID,
      },
      name: {
        default: true,
        filter: String,
      },
      entityType: {
        default: true,
        filter: String,
      },
      dependencies: {
        default: false,
        join: {
          documentType: Migration,
          cardinality: `many`,
        },
        filter: ObjectID,
      },
    },
  },
  data: {
    default: false,
    sort: false,
    filter: false,
  },
  entityURI: {
    default: true,
    filter: String,
  },
  error: {
    default: true,
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
