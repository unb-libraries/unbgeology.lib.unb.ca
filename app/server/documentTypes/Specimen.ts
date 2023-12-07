import { type EntityDocument, EntityFieldTypes } from "layers/mongo/types/entity"
import { type Specimen, Composition, type Storage, type Loan, LoanType, type Publication, Status } from "types/specimen"

type SpecimenDocument = EntityDocument<Omit<Specimen, `objectID`> & { objectID: Map<`unb`, string> & Map<`external` | `international`, string | undefined> & Map<string, string | undefined> }>
type StorageDocument = EntityDocument<Storage>
type LoanDocument = EntityDocument<Loan>
type PublicationDocument = EntityDocument<Publication>

export type SpecimenDraft = Partial<Specimen> & { status: Status.DRAFT }
const optionalWhileInDraft = function (this: Specimen) {
  return this.status !== Status.DRAFT
}

export default defineDocumentType<SpecimenDocument>(`Specimen`, {
  objectID: {
    type: EntityFieldTypes.Map,
    of: EntityFieldTypes.String,
    immutable: true,
    required: true,
  },
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
      ref: `Term.TaxonomyTerm.Classification`,
      required: optionalWhileInDraft,
    }],
  },
  measurements: [{
    width: {
      type: EntityFieldTypes.Number,
      required: true,
    },
    length: {
      type: EntityFieldTypes.Number,
      required: true,
    },
  }],
  date: {
    type: EntityFieldTypes.Date,
    required: false,
  },
  age: {
    relative: {
      type: EntityFieldTypes.ObjectId,
      ref: `Term.TaxonomyTerm.Geochronology`,
      required: optionalWhileInDraft,
    },
    numeric: {
      type: EntityFieldTypes.Number,
      required: false,
    },
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
    type: [defineEmbeddedDocumentType<LoanDocument>({
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
    type: [defineEmbeddedDocumentType<StorageDocument>({
      location: {
        type: EntityFieldTypes.ObjectId,
        ref: `Term.TaxonomyTerm.StorageLocation`,
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
    type: [defineEmbeddedDocumentType<PublicationDocument>({
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
  slug: (specimen: SpecimenDocument) => {
    const externalID = specimen.objectID.get(`external`)
    if (externalID) {
      return externalID.toString()
    }
    return specimen.objectID.get(`unb`)!.toString()
  },
  virtuals: {
    uri: {
      get(this: SpecimenDocument) {
        return `/api/specimens/${this.objectID.get(`unb`)!.toLowerCase()}`
      },
    },
  },
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
      ret.objectID = Object.fromEntries(doc.objectID.entries())
      ret.id = doc.objectID.get(`unb`)
    },
  },
})
