import {
  StringFilter as String,
  EnumFilter as Enum,
  ObjectIDFilter as ObjectID,
} from "#server/utils/api/filter"
import { Status } from "~~/types/classification"
import Image from "#server/documentTypes/Image"

export default defineMongooseEventQueryHandler(Classification.Mineral, defineEventQuery({
  parent: {
    default: true,
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
  composition: {
    default: false,
    filter: String,
  },
  status: {
    default: false,
    filter: Enum(Status),
  },
  type: {
    default: false,
    filter: (field, [op, value]) => (query) => {
      if ((Array.isArray(value) && value.includes(`classification/mineral`)) || value === `classification/mineral`) {
        return String(field, [op, Classification.Mineral.fullName])(query)
      }
    },
  },
}))
