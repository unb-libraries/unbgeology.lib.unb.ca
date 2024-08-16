import { MigrationItemStatus, MigrationStatus } from "@unb-libraries/nuxt-layer-entity"
import { Date, Enum, ObjectID, String } from "../../utils/api/filter"

export default defineMongooseEventQueryHandler(MigrationItem, defineEventQuery({
  id: {
    default: true,
    select: `sourceID`,
    sort: `sourceID`,
    filter: (_, condition) => String(`sourceID`, condition),
  },
  migration: {
    default: true,
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
        definition: {
          id: {
            default: false,
            select: `migration.dependencies._id`,
            filter: ObjectID,
          },
          name: {
            default: false,
            filter: String,
          },
          entityType: {
            default: false,
            filter: String,
          },
          status: {
            default: false,
            filter: Enum(MigrationStatus),
          },
        },
      },
    },
  },
  data: {
    default: true,
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
  queue: {
    default: true,
    filter: String,
  },
  status: {
    default: true,
    filter: Enum(MigrationItemStatus),
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
