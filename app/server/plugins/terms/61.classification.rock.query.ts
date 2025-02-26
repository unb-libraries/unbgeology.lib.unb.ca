import { Enum, ObjectID } from "~/layers/mongo/server/utils/api/filter"
import String from "~/layers/mongo/server/utils/api/filter/string"
import { Status } from "~/types/classification"
import Image from "~/layers/mongo/server/documentTypes/Image"

export default defineMongooseEventQueryHandler(Classification.Rock, defineEventQuery({
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
  ancestors: {
    default: true,
    join: {
      documentType: Term,
      cardinality: `many`,
    },
    sort: false,
    filter: false,
    definition: {
      id: {
        default: true,
        sort: false,
        filter: false,
      },
      label: {
        default: true,
        filter: false,
      },
    },
  },
  description: {
    default: true,
    sort: false,
    filter: false,
  },
  image: {
    default: true,
    join: Image,
    sort: false,
    filter: false,
    definition: {
      definition: {
        alt: {
          default: true,
          sort: false,
          filter: false,
        },
        title: {
          default: true,
          filter: String,
        },
        filename: {
          default: true,
          select: `images.filename`,
          sort: false,
          filter: false,
        },
        status: {
          default: true,
          select: `images.status`,
          sort: false,
          filter: false,
        },
      },
    }
  },
  status: {
    default: false,
    filter: Enum(Status),
  },
  type: {
    default: false,
    filter: (field, [op, value]) => (query) => {
      if ((Array.isArray(value) && value.includes(`classification/rock`)) || value === `classification/rock`) {
        return String(field, [op, Classification.Rock.fullName])(query)
      }
    },
  },
}))
