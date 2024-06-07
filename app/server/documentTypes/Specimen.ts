import { EntityFieldTypes } from "layers/mongo/types/entity"
import { Immeasurabibility, MeasurementType, Status } from "types/specimen"
import type { Entity, Stateful as IStateful } from "@unb-libraries/nuxt-layer-entity"
import type { Specimen as SpecimenEntity, Loan } from "types/specimen"
import type { Fossil as FossilCD, Mineral as MineralCD, Rock as RockCD } from "./Classification"
import type { Portion } from "./Portion"
import type { Person, Organization } from "./Affiliate"
import type { GeochronologicUnit } from "./Geochronology"
import type { StorageLocation as IStorageLocation } from "./StorageLocation"
import type { Collection as ICollection } from "./Collection"
import type { DocumentBase as IDocumentBase } from "~/layers/mongo/types/schema"
import ImageFile, { type Image } from "~/layers/mongo/server/documentTypes/Image"
import { type User } from "~/layers/mongo/server/documentTypes/User"
import { type Authorize as IAuthorize } from "~/layers/mongo/server/utils/mixins/Authorize"

export interface Specimen extends Omit<SpecimenEntity, keyof Entity | `type` | `classification` | `collection` | `images` | `age` | `measurements` | `collector` | `sponsor` | `loans` | `storage` | `creator` | `editor`>, IStateful<typeof Status>, IAuthorize, IDocumentBase {
  type: `Specimen.Fossil` | `Specimen.Mineral` | `Specimen.Rock`
  classification: FossilCD | MineralCD | RockCD
  classificationModel: string
  collection: ICollection
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

export interface FossilSpecimen extends Omit<Specimen, `classification` | keyof Entity>, IDocumentBase {
  classification: FossilCD
  portion: Portion
}

export interface MineralSpecimen extends Omit<Specimen, `classification` | keyof Entity>, IDocumentBase {
  classification: MineralCD
}

export interface RockSpecimen extends Omit<Specimen, `classification` | keyof Entity>, IDocumentBase {
  classification: RockCD
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
  pk: {
    type: EntityFieldTypes.String,
    required: true,
  },
  objectIDs: {
    type: [{
      id: {
        type: EntityFieldTypes.String,
        required: true,
      },
      type: {
        type: EntityFieldTypes.String,
        required: false,
      },
    }],
  },
  collection: {
    type: EntityFieldTypes.ObjectId,
    ref: Collection.mongoose.model,
    required: false,
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
    default(this: Specimen) {
      return {
        "Specimen.Fossil": Classification.Fossil.mongoose.model.modelName,
        "Specimen.Mineral": Classification.Mineral.mongoose.model.modelName,
        "Specimen.Rock": Classification.Rock.mongoose.model.modelName,
      }[this.type]
    },
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
        validator: function (this: Specimen, measurements: Specimen[`measurements`]) {
          return ((this.status as Status) & (Status.DRAFT | Status.MIGRATED)) || measurements.length > 0
        },
        message: `At least one measurement must be provided.`,
      },
      {
        validator: function (this: Specimen, measurements: Specimen[`measurements`]) {
          return ((this.status as Status) & (Status.DRAFT | Status.MIGRATED)) || measurements.every(m => m.type === MeasurementType.IMMEASURABLE) || measurements.every(m => m.type !== MeasurementType.IMMEASURABLE)
        },
        message: `All measurements must be either measurable or immeasurable.`,
      },
      {
        validator: function (this: Specimen, measurements: Specimen[`measurements`]) {
          return ((this.status as Status) & (Status.DRAFT | Status.MIGRATED)) || (measurements.every(m => m.type === MeasurementType.IMMEASURABLE) && measurements.length === 1) || true
        },
        message: `Only one immeasurable measurement is allowed.`,
      },
      {
        validator: function (this: Specimen, measurements: Specimen[`measurements`]) {
          return ((this.status as Status) & (Status.DRAFT | Status.MIGRATED)) || measurements.every(m => m.type === MeasurementType.IMMEASURABLE
            ? m.reason !== undefined && m.dimensions === undefined
            : true)
        },
        message: `Immeasurable measurements must provide a reason but no dimensions.`,
      },
      {
        validator: function (this: Specimen, measurements: Specimen[`measurements`]) {
          return ((this.status as Status) & (Status.DRAFT | Status.MIGRATED)) || measurements.every(m => m.type !== MeasurementType.IMMEASURABLE
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
      Term.mongoose.model.modelName,
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
      Term.mongoose.model.modelName,
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
      id: {
        type: EntityFieldTypes.String,
        required: true,
      },
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
    }],
  },
  market: {
    type: EntityFieldTypes.Number,
    required: false,
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
    default(this: Specimen) {
      return this.creator
    },
  },
}).mixin(Slugified<Specimen>({
  path: `pk`,
}))
  .mixin(State)
  .mixin(Authorize<Specimen>({
    paths: (specimen) => {
      const { creator, status, type } = specimen
      const statusLabel = useEnum(Status).labelOf(status).toLowerCase()
      const category = type.substring(type.indexOf(`.`) + 1).toLowerCase()
      return [
        `specimen`,
        `specimen:${statusLabel}`,
        `specimen:${category}`,
        `specimen:${category}:${statusLabel}`,
        `specimen:${creator.username}`,
        `specimen:${creator.username}:${category}`,
        `specimen:${creator.username}:${statusLabel}`,
        `specimen:${creator.username}:${category}:${statusLabel}`,
      ]
    },
  }))
  .mixin(DocumentBase())())

const Fossil = defineDocumentModel<Specimen, FossilSpecimen>(`Fossil`, defineDocumentSchema<FossilSpecimen>({
  portion: {
    type: EntityFieldTypes.ObjectId,
    ref: FossilPortion.mongoose.model,
    required: optionalForStatus(Status.MIGRATED | Status.DRAFT),
  },
})(), Specimen)

const Mineral = defineDocumentModel<Specimen, MineralSpecimen>(`Mineral`, defineDocumentSchema<MineralSpecimen>({

})(), Specimen)

const Rock = defineDocumentModel<Specimen, RockSpecimen>(`Rock`, defineDocumentSchema({

})(), Specimen)

export default {
  Base: Specimen,
  Fossil,
  Mineral,
  Rock,
}
