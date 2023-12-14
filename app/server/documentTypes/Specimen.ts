import { type EntityDocument, EntityFieldTypes } from "layers/mongo/types/entity"
import { type Specimen as SpecimenBase, Category, Composition, type Storage, type Loan, LoanType, type Publication, Status, Fossil } from "types/specimen"

type SpecimenDocument = EntityDocument<Omit<SpecimenBase, `objectID`> & { objectID: Map<`unb`, string> & Map<`external` | `international`, string | undefined> & Map<string, string | undefined> }>
type StorageDocument = EntityDocument<Storage>
type LoanDocument = EntityDocument<Loan>
type PublicationDocument = EntityDocument<Publication>

export type SpecimenDraft = Partial<SpecimenBase> & { status: Status.DRAFT }
const optionalWhileInDraft = function (this: SpecimenBase) {
  return this.status !== Status.DRAFT
}

export const Specimen = defineDocumentType<SpecimenDocument>(`Specimen`, {
  category: {
    type: EntityFieldTypes.String,
    enum: Category,
    required: true,
  },
  objectID: {
    type: EntityFieldTypes.Map,
    of: EntityFieldTypes.String,
    immutable: true,
    required: true,
    default: {
      unb: `UNB-${`${Math.floor(Math.random() * 1000000)}`.padStart(8, `0`)}`,
    },
  },
  classification: {
    type: EntityFieldTypes.ObjectId,
    required: optionalWhileInDraft,
    refPath: `classificationModel`,
  },
  classificationModel: {
    type: EntityFieldTypes.String,
    enum: [
      Fossilogy.Classification.modelName,
      Mineralogy.Classification.modelName,
      Petrology.Classification.modelName,
    ],
    required: true,
    default: function (this: SpecimenDocument) {
      return getClassificationModel(this.category).modelName
    },
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
      ref: Geochronology,
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
  portion: {
    type: EntityFieldTypes.ObjectId,
    refPath: `portionModel`,
    required: false,
  },
  portionModel: {
    type: EntityFieldTypes.String,
    enum: [
      Fossilogy.Portion.modelName,
      Mineralogy.Portion.modelName,
      Petrology.Portion.modelName,
    ],
    required: false,
    default: function (this: SpecimenDocument) {
      return getPortionModel(this.category).modelName
    },
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
    ref: Person,
    required: false,
  },
  sponsor: {
    type: EntityFieldTypes.ObjectId,
    ref: Person,
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
        ref: StorageLocation,
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
    ref: User,
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

      delete ret.classificationModel
      delete ret.portionModel
    },
  },
})
