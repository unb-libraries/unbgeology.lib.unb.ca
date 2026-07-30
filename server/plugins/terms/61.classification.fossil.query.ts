import {
  EnumFilter as Enum,
  ObjectIDFilter as ObjectID,
  StringFilter as String,
} from "#server/utils/api/filter"
import { Rank, Status } from "~~/types/classification"
import Image from "#server/documentTypes/Image"

export default defineMongooseEventQueryHandler(Classification.Fossil, defineEventQuery({
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
      id: {
        default: true,
        sort: false,
        filter: false,
      },
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
  },
  rank: {
    default: false,
    filter: Enum(Rank),
  },
  status: {
    default: false,
    filter: Enum(Status),
  },
  type: {
    default: false,
    filter: (field, [op, value]) => (query) => {
      if ((Array.isArray(value) && value.includes(`classification/fossil`)) || value === `classification/fossil`) {
        return String(field, [op, Classification.Fossil.fullName])(query)
      }
    },
  },
}))
