import { EntityFieldTypes } from "layers/mongo/types/entity"
import { Immeasurabibility, MeasurementType, ObjectIDType, Status } from "types/specimen"
import type { Entity, Stateful as IStateful } from "@unb-libraries/nuxt-layer-entity"
import type { Specimen as SpecimenEntity, Loan, Fossil as FossilEntity } from "types/specimen"
import type { Person, Organization } from "./Affiliate"
import type { GeochronologicUnit } from "./Geochronology"
import type { StorageLocation as IStorageLocation } from "./StorageLocation"
import type { DocumentBase as IDocumentBase } from "~/layers/mongo/types/schema"
import ImageFile, { type Image } from "~/layers/mongo/server/documentTypes/Image"
import { type User } from "~/layers/mongo/server/documentTypes/User"

export interface Specimen extends Omit<SpecimenEntity, keyof Entity | `images` | `age` | `measurements` | `collector` | `sponsor` | `loans` | `storage` | `creator` | `editor`>, IStateful<typeof Status>, IDocumentBase {
  classificationModel: string
  images: Image[]
  age: {
    relative: GeochronologicUnit
  } & Pick<SpecimenEntity[`age`], `numeric`>
  measurements: {
    type: MeasurementType
    dimensions?: number[]
    reason?: Immeasurabibility
  }[]
  collector?: Person | Organization
  collectorModel: string
  sponsor?: Person | Organization
  sponsorModel: string
  loans: Array<Omit<Loan, `start` | `end`> & {
    start: number
    end: number
  }>
  storage: {
    locations: IStorageLocation[]
    dates: {
      dateIn: number
      dateOut?: number
    }[]
  }
  creator: User
  editor: User
}

const State = Stateful({
  values: Status,
  default: Status.DRAFT,
})

function optionalForStatus(status: Status) {
  return function (this: Specimen) {
    return !((this.status as Status) & status)
  }
}

export const validationPatterns = {
  doi: /^10\.\d{4,9}\/[-._;()/:a-zA-Z0-9]+$/,
  email: /^.+@.+\..+$/,
  phone: /^\+?[\d\s\-()]+$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  partialDate: /^\d{4}(-\d{2}(-\d{2})?)?$/,
}

const Specimen = defineDocumentModel(`Specimen`, defineDocumentSchema<Specimen>({
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
      validator: function (this: Specimen) {
        return this.objectIDs.filter(objectID => objectID.primary).length === 1
      },
      message: `Exactly one primary object ID must be provided.`,
    },
  },
  classification: {
    type: EntityFieldTypes.ObjectId,
    required: optionalForStatus(Status.MIGRATED | Status.DRAFT),
    refPath: `classificationModel`,
  },
  classificationModel: {
    type: EntityFieldTypes.String,
    enum: [
      Classification.Fossil.mongoose.model.modelName,
      Classification.Mineral.mongoose.model.modelName,
      Classification.Rock.mongoose.model.modelName,
    ],
    required: true,
  },
  description: {
    type: EntityFieldTypes.String,
    required: optionalForStatus(Status.MIGRATED | Status.DRAFT),
  },
  images: [{
    type: EntityFieldTypes.ObjectId,
    ref: ImageFile.mongoose.model.modelName,
    required: false,
  }],
  measurements: {
    type: [{
      type: {
        type: EntityFieldTypes.String,
        enum: MeasurementType,
        default: MeasurementType.INDIVIDUAL,
      },
      dimensions: {
        type: [EntityFieldTypes.Number],
      },
      reason: {
        type: EntityFieldTypes.String,
        enum: Immeasurabibility,
      },
    }],
    required: optionalForStatus(Status.MIGRATED | Status.DRAFT),
    validate: [
      {
        validator: function (measurements: Specimen[`measurements`]) {
          return measurements.length > 0
        },
        message: `At least one measurement must be provided.`,
      },
      {
        validator: function (measurements: Specimen[`measurements`]) {
          return measurements.every(m => m.type === MeasurementType.IMMEASURABLE) || measurements.every(m => m.type !== MeasurementType.IMMEASURABLE)
        },
        message: `All measurements must be either measurable or immeasurable.`,
      },
      {
        validator: function (measurements: Specimen[`measurements`]) {
          return (measurements.every(m => m.type === MeasurementType.IMMEASURABLE) && measurements.length === 1) || true
        },
        message: `Only one immeasurable measurement is allowed.`,
      },
      {
        validator: function (measurements: Specimen[`measurements`]) {
          return measurements.every(m => m.type === MeasurementType.IMMEASURABLE
            ? m.reason !== undefined && m.dimensions === undefined
            : true)
        },
        message: `Immeasurable measurements must provide a reason but no dimensions.`,
      },
      {
        validator: function (measurements: Specimen[`measurements`]) {
          return measurements.every(m => m.type !== MeasurementType.IMMEASURABLE
            ? m.reason === undefined && m.dimensions !== undefined
            : true)
        },
        message: `Measurable measurements must provide dimensions but no reason.`,
      },
    ],
  },
  date: {
    type: EntityFieldTypes.String,
    required: false,
    validate: {
      validator: function (dateStr: Specimen[`date`]) {
        if (!dateStr) { return true }
        try {
          const date = new Date(dateStr)
          return date !== undefined && !isNaN(date.getTime())
        } catch {
          return false
        }
      },
      message: `Invalid date. Expected format YYYY, YYYY-MM, or YYYY-MM-DD`,
    },
  },
  age: {
    type: {
      relative: {
        type: EntityFieldTypes.ObjectId,
        ref: Geochronology.mongoose.model,
      },
      numeric: {
        type: EntityFieldTypes.Number,
      },
    },
    validate: [
      {
        validator: function (age: Specimen[`age`]) {
          return age.relative !== undefined || age.numeric !== undefined
        },
        message: `Either a relative or numeric age must be provided.`,
      },
      {
        validator: async function ({ relative, numeric }: Specimen[`age`]) {
          if (!(relative && numeric)) {
            return true
          }
          const unit = await Geochronology.findByID(`${relative}`).select(`boundaries`)
          const { lower, upper } = unit!.boundaries
          return numeric > lower && numeric < upper
        },
        message: `The numeric age does not match the geochronologi unit.`,
      },
    ],
  },
  origin: {
    type: {
      latitude: {
        type: EntityFieldTypes.Number,
        min: -90,
        max: 90,
        required: optionalForStatus(Status.MIGRATED),
      },
      longitude: {
        type: EntityFieldTypes.Number,
        min: -180,
        max: 180,
        required: optionalForStatus(Status.MIGRATED),
      },
      accuracy: {
        type: EntityFieldTypes.Number,
        required: false,
        min: 0,
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
    required: optionalForStatus(Status.MIGRATED | Status.DRAFT),
  },
  pieces: {
    type: EntityFieldTypes.Number,
    min: 1,
    required: optionalForStatus(Status.MIGRATED | Status.DRAFT),
  },
  partial: {
    type: EntityFieldTypes.Boolean,
    required: optionalForStatus(Status.MIGRATED | Status.DRAFT),
    default: false,
  },
  collector: {
    type: EntityFieldTypes.ObjectId,
    refPath: `collectorModel`,
    required: false,
  },
  collectorModel: {
    type: EntityFieldTypes.String,
    enum: [
      Affiliate.Person.mongoose.model.modelName,
      Affiliate.Organization.mongoose.model.modelName,
    ],
    required(this: Specimen) {
      return this.collector !== undefined
    },
  },
  sponsor: {
    type: EntityFieldTypes.ObjectId,
    refPath: `sponsorModel`,
    required: false,
  },
  sponsorModel: {
    type: EntityFieldTypes.String,
    enum: [
      Affiliate.Person.mongoose.model.modelName,
      Affiliate.Organization.mongoose.model.modelName,
    ],
    required(this: Specimen) {
      return this.sponsor !== undefined
    },
  },
  loans: {
    type: [{
      received: {
        type: EntityFieldTypes.Boolean,
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
          match: validationPatterns.email,
          required: true,
        },
        phone: {
          type: EntityFieldTypes.String,
          match: validationPatterns.phone,
          required: true,
        },
      },
      start: {
        type: EntityFieldTypes.Number,
        required: true,
      },
      end: {
        type: EntityFieldTypes.Number,
        required: true,
      },
    }],
    validate: [
      {
        validator: function (loans: Specimen[`loans`]) {
          return !loans || loans.every(loan => loan.start <= loan.end)
        },
        message: `Loan start date must precede end date.`,
      },
    ],
  },
  storage: {
    type: {
      locations: [{
        type: EntityFieldTypes.ObjectId,
        ref: StorageLocation.mongoose.model,
      }],
      dates: [{
        dateIn: EntityFieldTypes.Number,
        dateOut: EntityFieldTypes.Number,
      }],
    },
    validate: [
      {
        validator: function (this: Specimen, storage: Specimen[`storage`]) {
          return storage || (this.status as Status) & (Status.MIGRATED | Status.DRAFT)
        },
        message: `Storage is required.`,
      },
      {
        validator: function (this: Specimen, storage: Specimen[`storage`]) {
          return !storage || storage.locations.length === storage.dates.length
        },
        message: `The number of locations must match the number of dates.`,
      },
      {
        validator: function (this: Specimen, storage: Specimen[`storage`]) {
          return !storage || !storage.dates.slice(1).some(d => d.dateIn === undefined)
        },
        message: `Each entry must provide an incoming date.`,
      },
      {
        validator: function (this: Specimen, storage: Specimen[`storage`]) {
          return storage.dates.length < 2 || storage.dates.reverse().slice(1).some(s => s.dateOut === undefined)
        },
        message: `Each but the most recent entry must provide an outgoing date.`,
      },
      {
        validator: function (this: Specimen, storage: Specimen[`storage`]) {
          return storage.dates.length < 2 || storage.dates.every(s => !s.dateOut || s.dateIn <= s.dateOut)
        },
        message: `Each entry's incoming date must precede its outgoing date.`,
      },
      {
        validator: function (this: Specimen, storage: Specimen[`storage`]) {
          return storage.dates.length < 2 || storage.dates.slice(1).every((s, i) => s.dateIn >= storage.dates[i].dateOut!)
        },
        message: `Each entry's incoming date must follow the previous entry's outgoing date.`,
      },
    ],
  },
  publications: {
    type: [{
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
        match: validationPatterns.doi,
        required: false,
      },
    }],
  },
  status: {
    type: EntityFieldTypes.Number,
    required: true,
    enum: Status,
    default: Status.DRAFT,
  },
  creator: {
    type: EntityFieldTypes.ObjectId,
    ref: User.mongoose.model,
    required: optionalForStatus(Status.MIGRATED),
  },
  editor: {
    type: EntityFieldTypes.ObjectId,
    ref: User.mongoose.model,
    required: optionalForStatus(Status.MIGRATED),
    default(this: Specimen) {
      return this.creator
    },
  },
}).mixin(Slugified<Specimen>({
  path: doc => doc.objectIDs.find(id => id.primary)!.id,
}))
  .mixin(State)
  .mixin(DocumentBase())())

const Fossil = defineDocumentModel(`Fossil`, defineDocumentSchema<Omit<FossilEntity, `type` | `classification` | keyof Entity> & Specimen>({
  portion: {
    type: EntityFieldTypes.ObjectId,
    ref: FossilPortion.mongoose.model,
    required: optionalForStatus(Status.MIGRATED | Status.DRAFT),
  },
})(), Specimen)

const Mineral = defineDocumentModel(`Mineral`, defineDocumentSchema({

})(), Specimen)

const Rock = defineDocumentModel(`Rock`, defineDocumentSchema({

})(), Specimen)

export default {
  Base: Specimen,
  Fossil,
  Mineral,
  Rock,
}
