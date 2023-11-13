import { type EntityDocument, EntityFieldTypes } from "layers/mongo/types/entity"
import { type Specimen, Composition, type Storage, type Loan, LoanType, type Publication, Status } from "types/specimen"

type SpecimenDocument = EntityDocument<Specimen>
type StorageDocument = EntityDocument<Storage>
type LoanDocument = EntityDocument<Loan>
type PublicationDocument = EntityDocument<Publication>

export type SpecimenDraft = Partial<Specimen> & { status: Status.DRAFT }
const optionalWhileInDraft = function (this: Specimen) {
  return this.status !== Status.DRAFT
}

export default defineEntityType<SpecimenDocument>(`Specimen`, {
  name: {
    type: EntityFieldTypes.String,
    required: true,
  },
  description: {
    type: EntityFieldTypes.String,
    required: optionalWhileInDraft,
  },
  images: [{
    type: EntityFieldTypes.ObjectId,
    ref: `File.Image`,
    required: false,
  }],
  classifications: {
    type: [{
      type: EntityFieldTypes.ObjectId,
      ref: `Taxonomy.Classification`,
      required: optionalWhileInDraft,
    }],
  },
  dimensions: {
    type: {
      width: {
        type: EntityFieldTypes.Number,
      },
      length: {
        type: EntityFieldTypes.Number,
      },
    },
    required: optionalWhileInDraft,
  },
  date: {
    type: EntityFieldTypes.Date,
    required: false,
  },
  age: {
    type: EntityFieldTypes.String,
    required: optionalWhileInDraft,
  },
  origin: {
    type: {
      latitude: {
        type: EntityFieldTypes.Number,
        required: true,
      },
      longitude: {
        type: EntityFieldTypes.Number,
        required: true,
      },
    },
    required: optionalWhileInDraft,
  },
  pieces: {
    type: EntityFieldTypes.Number,
    required: optionalWhileInDraft,
  },
  partial: {
    type: EntityFieldTypes.Boolean,
    required: optionalWhileInDraft,
  },
  composition: {
    type: EntityFieldTypes.String,
    enum: Composition,
    required: optionalWhileInDraft,
  },
  collector: {
    type: EntityFieldTypes.ObjectId,
    ref: `Affiliation.Person`,
    required: false,
  },
  sponsor: {
    type: EntityFieldTypes.ObjectId,
    ref: `Affiliation.Person`,
    required: false,
  },
  loans: {
    type: [defineEmbeddedEntityType<LoanDocument>({
      type: {
        type: EntityFieldTypes.String,
        enum: LoanType,
        required: true,
      },
      contact: {
        name: {
          type: EntityFieldTypes.String,
          required: true,
        },
        affiliation: {
          type: EntityFieldTypes.String,
          required: true,
        },
        email: {
          type: EntityFieldTypes.String,
          required: true,
        },
        phone: {
          type: EntityFieldTypes.String,
          required: true,
        },
      },
      start: {
        type: EntityFieldTypes.Date,
        required: true,
      },
      end: {
        type: EntityFieldTypes.Date,
        required: true,
      },
    })],
  },
  storage: {
    type: [defineEmbeddedEntityType<StorageDocument>({
      location: {
        type: EntityFieldTypes.ObjectId,
        ref: `Taxonomy.StorageLocation`,
        required: true,
      },
      dateIn: {
        type: EntityFieldTypes.Date,
        required: true,
      },
      dateOut: {
        type: EntityFieldTypes.Date,
        required: false,
      },
    })],
  },
  publications: {
    type: [defineEmbeddedEntityType<PublicationDocument>({
      citation: {
        type: EntityFieldTypes.String,
        required: true,
      },
      abstract: {
        type: EntityFieldTypes.String,
        required: false,
      },
      doi: {
        type: EntityFieldTypes.String,
        required: false,
      },
    })],
  },
  status: {
    type: EntityFieldTypes.String,
    required: true,
    enum: Status,
    default: Status.DRAFT,
  },
  editor: {
    type: EntityFieldTypes.ObjectId,
    ref: `User`,
    required: false,
  },
}, {
  slug: `name`,
  toJSON: {
    transform(doc, ret) {
      if (ret.origin) {
        delete ret.origin._id
        delete ret.origin.id
      }
      if (ret.dimensions) {
        delete ret.dimensions._id
        delete ret.dimensions.id
      }
    },
  },
})
