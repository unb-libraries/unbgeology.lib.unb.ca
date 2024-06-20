import { MigrationStatus } from "@unb-libraries/nuxt-layer-entity"
import { Date, Enum, Numeric, ObjectID, String } from "../../utils/api/filter"

export default defineMongooseEventQueryHandler(Migration, defineEventQuery({
  id: {
    default: true,
    select: `_id`,
    filter: (_, condition) => ObjectID(`_id`, condition),
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
    default: true,
    join: {
      documentType: Migration,
      cardinality: `many`,
    },
    filter: ObjectID,
    definition: {
      id: {
        default: false,
        select: `dependencies._id`,
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
  total: {
    default: true,
    filter: Numeric,
  },
  imported: {
    default: true,
    filter: Numeric,
  },
  skipped: {
    default: true,
    filter: Numeric,
  },
  errored: {
    default: true,
    filter: Numeric,
  },
  status: {
    default: true,
    filter: Enum(MigrationStatus),
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
