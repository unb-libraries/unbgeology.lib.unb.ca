import { Boolean, Date, Enum, Count, Numeric, ObjectID, String } from "~/layers/mongo/server/utils/api/filter"
import { Legal, MeasurementCount, Status } from "~/types/specimen"

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
  legal: {
    default: true,
    filter: Enum(Legal),
  },
  lenderID: {
    default: true,
    filter: String,
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
      composition: {
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
    select: `kollektion`,
    join: {
      documentType: Term,
      localField: `kollektion`,
      cardinality: `one`,
    },
    sort: `kollection.label`,
    filter: (_, condition) => ObjectID(`kollektion`, condition),
    definition: {
      label: {
        default: true,
        select: `kollektion.label`,
        filter: (_, condition) => String(`kollektion.label`, condition),
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
      count: {
        default: true,
        filter: Enum(MeasurementCount),
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
    filter: (_, condition) => Numeric(`age.unit`, condition),
    definition: {
      unit: {
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
        },
      },
      numeric: {
        default: true,
        filter: Numeric,
      },
    },
  },
  composition: {
    default: true,
    join: {
      documentType: Term,
      cardinality: `many`,
    },
    sort: `composition.label`,
    filter: (_, condition) => Numeric(`composition.label`, condition),
    definition: {
      label: {
        default: true,
        filter: String,
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
    select: `storage storageLocations`,
    sort: false,
    filter: (_, condition) => ObjectID(`storageLocations`, condition),
    definition: {
      dateIn: {
        default: true,
        select: `storage.dateIn`,
        filter: (_, condition) => Date(`storage.dates.dateIn`, condition),
      },
      dateOut: {
        default: true,
        select: `storage.dateOut`,
        filter: (_, condition) => Date(`storage.dates.dateOut`, condition),
      },
      location: {
        default: true,
        select: `storage.location`,
        join: {
          documentType: StorageLocation,
          localField: `storageLocations`,
          cardinality: `many`,
        },
        filter: (_, condition) => ObjectID(`storageLocations`, condition),
        definition: {
          label: {
            default: true,
            select: `storageLocations.label`,
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
  appraisal: {
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
    filter: (_, [op, value]) => String(`type`, [op, `Specimen.${value[0].toUpperCase() + value.slice(1)}`]),
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
