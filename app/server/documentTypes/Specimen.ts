import { type EntityDocument, EntityFieldTypes } from "layers/mongo/types/entity"
import { type Specimen as SpecimenBase, Category, Composition, type Storage, type Loan, LoanType, type Publication, Status, Fossil, ObjectIDType, Unmeasurability, MeasurementType } from "types/specimen"

type SpecimenDocument = EntityDocument<SpecimenBase>
type StorageDocument = EntityDocument<Storage>
type LoanDocument = EntityDocument<Loan>
type PublicationDocument = EntityDocument<Publication>

export type SpecimenDraft = Partial<SpecimenBase> & { status: Status.DRAFT }
function optionalForStatus(status: Status) {
  return function (this: SpecimenBase) {
    return !(this.status & status)
  }
}

export const Specimen = defineDocumentType<SpecimenDocument>(`Specimen`, {
  category: {
    type: EntityFieldTypes.String,
    enum: Category,
    required: true,
  },
  objectIDs: {
    type: [{
      id: {
        type: EntityFieldTypes.String,
        required: true,
      },
      primary: {
        type: EntityFieldTypes.Boolean,
        required: false,
      },
      type: {
        type: EntityFieldTypes.String,
        enum: ObjectIDType,
        required: false,
      },
    }],
    validate: {
      validator: function (this: SpecimenDocument) {
        return this.objectIDs.filter(objectID => objectID.primary).length > 0
      },
      message: `No primary object ID provided`,
    },
  },
  classification: {
    type: EntityFieldTypes.ObjectId,
    required: optionalForStatus(Status.IMPORTED | Status.DRAFT),
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
    required: optionalForStatus(Status.IMPORTED | Status.DRAFT),
  },
  images: [{
    type: EntityFieldTypes.ObjectId,
    ref: `File.Image`,
    required: false,
  }],
  unmeasureable: {
    type: EntityFieldTypes.String,
    enum: Unmeasurability,
    required: false,
  },
  measurements: [{
    type: {
      type: EntityFieldTypes.String,
      enum: MeasurementType,
      default: MeasurementType.INDIVIDUAL,
      required: true,
    },
    dimensions: {
      type: [{
        type: EntityFieldTypes.Number,
        required: function (this: SpecimenDocument) {
          return !this.unmeasureable
        },
      }],
      required: false,
    },
  }],
  date: {
    type: {
      year: {
        type: EntityFieldTypes.Number,
        required: true,
      },
      month: {
        type: EntityFieldTypes.Number,
        required: false,
      },
      day: {
        type: EntityFieldTypes.Number,
        required: false,
      },
    },
    required: false,
  },
  age: {
    relative: {
      type: EntityFieldTypes.ObjectId,
      ref: Geochronology,
      required: optionalForStatus(Status.IMPORTED | Status.DRAFT),
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
        required: optionalForStatus(Status.IMPORTED | Status.DRAFT),
      },
      longitude: {
        type: EntityFieldTypes.Number,
        required: optionalForStatus(Status.IMPORTED | Status.DRAFT),
      },
      accuracy: {
        type: EntityFieldTypes.Number,
        required: false,
        default: 0,
      },
      name: {
        type: EntityFieldTypes.String,
        required: true,
      },
      description: {
        type: EntityFieldTypes.String,
        required: false,
      },
    },
    required: optionalForStatus(Status.IMPORTED | Status.DRAFT),
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
    required: optionalForStatus(Status.IMPORTED | Status.DRAFT),
  },
  partial: {
    type: EntityFieldTypes.Boolean,
    required: optionalForStatus(Status.IMPORTED | Status.DRAFT),
  },
  composition: {
    type: EntityFieldTypes.String,
    enum: Composition,
    required: optionalForStatus(Status.IMPORTED | Status.DRAFT),
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
    type: EntityFieldTypes.Number,
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
    const objectID = specimen.objectIDs.find(objectID => objectID.primary)
    return objectID?.id
  },
  virtuals: {
    uri: {
      get(this: SpecimenDocument) {
        return `/api/specimens/${this.slug}`
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
      ret.id = doc.slug

      delete ret.classificationModel
      delete ret.portionModel
    },
  },
})
