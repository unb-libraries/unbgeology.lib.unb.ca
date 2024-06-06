import { Boolean, Date, Enum, Count, Numeric, ObjectID, String } from "~/layers/mongo/server/utils/api/filter"
import { Category, MeasurementType, Status } from "~/types/specimen"

export default defineMongooseEventQueryHandler(Specimen.Base, defineEventQuery({
  id: {
    default: true,
    select: `slug`,
    sort: `slug`,
    filter: (_, condition) => String(`slug`, condition),
  },
  objectIDs: {
    default: true,
    sort: false,
    filter: (_, condition) => String(`objectIDs.id`, condition),
    definition: {
      id: {
        default: true,
        sort: false,
        filter: String,
      },
      type: {
        default: true,
        sort: false,
        filter: String,
      },
    },
  },
  classification: {
    default: true,
    join: Term,
    sort: `classification.label`,
    filter: ObjectID,
    definition: {
      label: {
        default: true,
        filter: String,
      },
    },
  },
  description: {
    default: true,
    sort: false,
    filter: false,
  },
  collection: {
    default: true,
    join: Term,
    sort: `collection.label`,
    filter: ObjectID,
    definition: {
      label: {
        default: true,
        filter: String,
      },
    },
  },
  images: {
    default: true,
    join: {
      documentType: FileBase,
      cardinality: `many`,
    },
    sort: false,
    filter: Count,
    definition: {
      count: {
        default: true,
        select: false,
        sort: false,
        filter: (_, condition) => Count(`images`, condition),
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
  measurements: {
    default: true,
    sort: false,
    filter: (_, condition) => Numeric(`measurements.dimensions`, condition),
    definition: {
      type: {
        default: true,
        filter: Enum(MeasurementType),
      },
      dimensions: {
        default: true,
        sort: false,
        filter: Numeric,
      },
      reason: {
        default: true,
        sort: false,
        filter: false,
      },
    },
  },
  date: {
    default: true,
    filter: String,
  },
  age: {
    default: true,
    filter: (_, condition) => Numeric(`age.relative`, condition),
    definition: {
      relative: {
        default: true,
        join: Term,
        filter: ObjectID,
        definition: {
          label: {
            default: true,
            filter: String,
          },
          boundaries: {
            default: true,
            filter: (_, condition) => Numeric(`boundaries.lower`, condition),
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
            default: true,
            filter: Boolean,
          },
          uncertainty: {
            default: true,
            filter: false,
          },
          color: {
            default: true,
            filter: false,
          },
        },
      },
      numeric: {
        default: false,
        filter: Numeric,
      },
    },
  },
  origin: {
    default: true,
    sort: false,
    filter: false,
    definition: {
      latitude: {
        default: true,
        filter: Numeric,
      },
      longitude: {
        default: true,
        filter: Numeric,
      },
      accuracy: {
        default: true,
        filter: false,
      },
      name: {
        default: true,
        filter: false,
      },
      description: {
        default: true,
        filter: false,
      },
    },
  },
  pieces: {
    default: true,
    filter: Numeric,
  },
  partial: {
    default: true,
    filter: Boolean,
  },
  collector: {
    default: true,
    join: Term,
    sort: `collector.label`,
    filter: ObjectID,
    definition: {
      label: {
        default: true,
        filter: String,
      },
      name: {
        default: true,
        filter: String,
      },
      firstName: {
        default: true,
        filter: String,
      },
      lastName: {
        default: true,
        filter: String,
      },
      type: {
        default: true,
        filter: String,
      },
    },
  },
  sponsor: {
    default: true,
    join: Term,
    sort: `sponsor.label`,
    filter: ObjectID,
    definition: {
      label: {
        default: true,
        filter: String,
      },
      name: {
        default: true,
        filter: String,
      },
      firstName: {
        default: true,
        filter: String,
      },
      lastName: {
        default: true,
        filter: String,
      },
      type: {
        default: true,
        filter: String,
      },
    },
  },
  loans: {
    default: true,
    sort: `-loans.received -loans.end`,
    filter: false,
    definition: {
      received: {
        default: true,
        filter: Boolean,
      },
      start: {
        default: true,
        filter: Date,
      },
      end: {
        default: true,
        filter: Date,
      },
      contact: {
        default: true,
        filter: false,
        definition: {
          name: {
            default: true,
            filter: String,
          },
          email: {
            default: true,
            filter: String,
          },
          phone: {
            default: true,
            filter: String,
          },
        },
      },
    },
  },
  storage: {
    default: true,
    sort: false,
    filter: false,
    definition: {
      dateIn: {
        default: true,
        select: `storage.dates.dateIn`,
        filter: (_, condition) => Date(`storage.dates.dateIn`, condition),
      },
      dateOut: {
        default: true,
        select: `storage.dates.dateOut`,
        filter: (_, condition) => Date(`storage.dates.dateOut`, condition),
      },
      location: {
        default: true,
        select: `storage.locations`,
        join: {
          documentType: Term,
          localField: `storage.locations`,
          cardinality: `many`,
        },
        filter: (_, condition) => ObjectID(`storage.locations`, condition),
        definition: {
          label: {
            default: true,
            select: `storage.locations.label`,
            filter: String,
          },
        },
      },
    },
  },
  publications: {
    default: true,
    sort: `publications.citation`,
    filter: (_, condition) => String(`publications.citation`, condition),
    definition: {
      id: {
        default: true,
        filter: false,
      },
      citation: {
        default: true,
        filter: String,
      },
      abstract: {
        default: true,
        filter: false,
      },
      doi: {
        default: true,
        filter: false,
      },
    },
  },
  market: {
    default: true,
    filter: Numeric,
  },
  status: {
    default: true,
    filter: Enum(Status),
  },
  creator: {
    default: true,
    join: User,
    sort: `creator.username`,
    filter: ObjectID,
    definition: {
      username: {
        default: true,
        filter: String,
      },
      profile: {
        default: false,
        filter: false,
        definition: {
          firstName: {
            default: true,
            filter: String,
          },
          lastName: {
            default: true,
            filter: String,
          },
        },
      },
    },
  },
  editor: {
    default: true,
    join: User,
    sort: `editor.username`,
    filter: ObjectID,
    definition: {
      username: {
        default: true,
        filter: String,
      },
      profile: {
        default: false,
        filter: false,
        definition: {
          firstName: {
            default: true,
            filter: String,
          },
          lastName: {
            default: true,
            filter: String,
          },
        },
      },
    },
  },
  type: {
    default: true,
    filter: Enum(Category),
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
