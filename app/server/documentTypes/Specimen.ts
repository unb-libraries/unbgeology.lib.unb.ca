import { EntityFieldTypes } from "layers/mongo/types/entity"
import { Immeasurabibility, Legal, MeasurementCount, Status } from "types/specimen"
import type { Entity, Stateful as IStateful } from "@unb-libraries/nuxt-layer-entity"
import type { Specimen as SpecimenEntity, Loan } from "types/specimen"
import type { Fossil as FossilCD, Mineral as MineralCD, Rock as RockCD } from "./Classification"
import type { Portion } from "./Portion"
import type { Person, Organization } from "./Affiliate"
import type { GeochronologicUnit } from "./Geochronology"
import type { StorageLocation as IStorageLocation } from "./StorageLocation"
import type { Collection as ICollection } from "./Collection"
import type { Composition as IComposition } from "./Composition"
import type { DocumentBase as IDocumentBase } from "~/layers/mongo/types/schema"
import ImageFile, { type Image } from "~/layers/mongo/server/documentTypes/Image"
import { type User } from "~/layers/mongo/server/documentTypes/User"
import { type Authorize as IAuthorize } from "~/layers/mongo/server/utils/mixins/Authorize"
import type { IPIKable as IIPIKable } from "~/layers/mongo/server/utils/mixins/IPIKable"

export interface Specimen extends Omit<SpecimenEntity, keyof Entity | `type` | `classification` | `collection` | `images` | `age` | `composition` | `measurements` | `collector` | `sponsor` | `loans` | `storage` | `creator` | `editor`>, IStateful<typeof Status>, IIPIKable, IAuthorize, IDocumentBase {
  type: `Specimen.Fossil` | `Specimen.Mineral` | `Specimen.Rock`
  ypik: string
  classification: FossilCD | MineralCD | RockCD
  classificationModel: string
  kollektion: ICollection
  images: Image[]
  relativeAge: GeochronologicUnit[]
  numericAge: SpecimenEntity[`age`][`numeric`]
  measurements: {
    count: MeasurementCount
    dimensions?: [number, number, number][]
    reason?: Immeasurabibility
  }
  longestEdge?: number
  collector?: Person | Organization
  collectorModel: string
  sponsor?: Person | Organization
  sponsorModel: string
  loans: Array<Omit<Loan, `start` | `end`> & {
    start: number
    end: number
  }>
  storageLocations: IStorageLocation[]
  storage: {
    id: string
    location: IStorageLocation
    dateIn: number
    dateOut?: number
  }[]
  creator: User
  editor: User
}

export interface FossilSpecimen extends Omit<Specimen, `classification` | `composition` | keyof Entity>, IDocumentBase {
  classification: FossilCD
  composition: IComposition[]
  portion: Portion
}

export interface MineralSpecimen extends Omit<Specimen, `classification` | keyof Entity>, IDocumentBase {
  classification: MineralCD
}

export interface RockSpecimen extends Omit<Specimen, `classification` | `composition` | keyof Entity>, IDocumentBase {
  classification: RockCD
  composition: IComposition[]
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
    required: false,
    unique: true,
    immutable: true,
    default() {
      return `UNB-${`${Math.floor(Math.random() * 1000000)}`.padStart(8, `0`)}`
    },
  },
  ypik: {
    type: EntityFieldTypes.String,
    required: false,
    unique: true,
    // TODO: Set immutable after all data is migrated
    // immutable: true,
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
  mimsyID: {
    type: EntityFieldTypes.String,
    required: false,
  },
  legal: {
    type: EntityFieldTypes.Number,
    enum: Legal,
    required: true,
    default: Legal.PERMANENT,
  },
  lenderID: {
    type: EntityFieldTypes.String,
    required: false,
    validate: [{
      validator: function (this: Specimen) {
        return this.legal !== Legal.LOAN || this.lenderID
      },
      message: `Loanded specimens must provide a Lender ID.`,
    }, {
      validator: function (this: Specimen) {
        return this.legal !== Legal.PERMANENT || !this.lenderID
      },
      message: `Permanent collection specimens must not provide a Lender ID.`,
    }],
  },
  kollektion: {
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
  name: {
    type: EntityFieldTypes.String,
    required: false,
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
    type: {
      count: {
        type: EntityFieldTypes.String,
        enum: MeasurementCount,
        default: MeasurementCount.INDIVIDUAL,
      },
      dimensions: [[EntityFieldTypes.Number, EntityFieldTypes.Number, EntityFieldTypes.Number]],
      reason: {
        type: EntityFieldTypes.String,
        enum: Immeasurabibility,
      },
    },
    validate: [
      {
        validator: function (this: Specimen, measurements: Specimen[`measurements`]) {
          return ((this.status as Status) & (Status.DRAFT | Status.MIGRATED)) || (measurements && Object.keys(measurements).length)
        },
        message: `Measurements are required.`,
      },
      {
        validator: function (this: Specimen, { count, dimensions }: Specimen[`measurements`]) {
          return count !== MeasurementCount.CONTAINER || dimensions?.length === 1
        },
        message: `Must provide exactly one set of dimensions for container measurements.`,
      },
      {
        validator: function (this: Specimen, { count, dimensions }: Specimen[`measurements`]) {
          return count !== MeasurementCount.AGGREGATE || dimensions?.length === 3
        },
        message: `Must provide exactly three sets of dimensions for aggregate measurements.`,
      },
      {
        validator: function (this: Specimen, { count, dimensions }: Specimen[`measurements`]) {
          return count !== MeasurementCount.INDIVIDUAL || dimensions?.length === this.pieces
        },
        message: `Must provide one set of dimensions per individual piece.`,
      },
      {
        validator: function (this: Specimen, { count, reason }: Specimen[`measurements`]) {
          return count !== MeasurementCount.IMMEASURABLE || reason
        },
        message: `Must provide a reason for immeasurable items.`,
      },
    ],
  },
  longestEdge: {
    type: EntityFieldTypes.Number,
    required: false,
    default(this: Specimen) {
      return this.measurements?.dimensions?.reduce((max, dimensions) => Math.max(max, Math.max(...dimensions)), 0)
    },
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
  relativeAge: [{
    type: EntityFieldTypes.ObjectId,
    ref: Geochronology.mongoose.model,
  }],
  numericAge: [{
    type: EntityFieldTypes.Number,
  }],
  composition: [{
    type: EntityFieldTypes.ObjectId,
    refPath: `compositionModel`,
    required: false,
  }],
  compositionModel: {
    type: EntityFieldTypes.String,
    enum: [
      Composition.Fossil.mongoose.model.modelName,
      Composition.Rock.mongoose.model.modelName,
    ],
    required: false,
    default(this: Specimen) {
      return {
        "Specimen.Fossil": Composition.Fossil.mongoose.model.modelName,
        "Specimen.Mineral": undefined,
        "Specimen.Rock": Composition.Rock.mongoose.model.modelName,
      }[this.type]
    },
  },
  origin: {
    type: {
      latitude: {
        type: EntityFieldTypes.Number,
        min: -90,
        max: 90,
        required: false,
      },
      longitude: {
        type: EntityFieldTypes.Number,
        min: -180,
        max: 180,
        required: false,
      },
      accuracy: {
        type: EntityFieldTypes.Number,
        required: false,
        min: 0,
        default: 0,
      },
      name: {
        type: EntityFieldTypes.String,
        required: false,
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
    required: false,
    default() {
      return Term.mongoose.model.modelName
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
    required: false,
    default() {
      return Term.mongoose.model.modelName
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
  storageLocations: {
    type: [{
      type: EntityFieldTypes.ObjectId,
      ref: StorageLocation.mongoose.model,
    }],
  },
  storage: {
    type: [{
      location: EntityFieldTypes.ObjectId,
      dateIn: EntityFieldTypes.Number,
      dateOut: EntityFieldTypes.Number,
    }],
    required: optionalForStatus(Status.MIGRATED | Status.DRAFT),
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
  appraisal: {
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
}, {
  alterSchema(schema) {
    schema.pre(`save`, async function () {
      // Set mimsyID
      this.mimsyID = this.objectIDs?.find(({ type }) => type?.toLowerCase() === `mimsy`)?.id

      // Set ypik
      if (this.isNew && this.mimsyID) {
        this.ypik = this.mimsyID.split(`-`).slice(1).map(mid => mid.padStart(4, `0`)).join(`-`)
      } else if (this.isNew) {
        this.ypik = (await createYPIK(this.collection.collectionName))
          .map(n => `${n}`.padStart(4, `0`))
          .join(`-`)
      }

      if (this.isNew && this.ypik) {
        this.slug = [`unb`, ...this.ypik.split(`-`)].join(`-`)
      }

      // Set relative age based on numeric age
      if (this.relativeAge?.length) {
        // sort by earliest to latest
        this.relativeAge = this.relativeAge.sort((a, b) => b.start - a.start)
      }
      if (this.numericAge?.length) {
        // sort by earliest to latest
        this.numericAge = this.numericAge.sort((a, b) => b - a)
        this.relativeAge = (await Promise.all(this.numericAge.map(yearsAgo => Geochronology.findOne()
          .where(`start`).gte(yearsAgo)
          .sort(`start`, `-division`))))
          .filter(unit => unit)
          .reduce((units, unit) => units.some(u => u!._id === unit!._id)
            ? units as GeochronologicUnit[]
            : [...units, unit] as GeochronologicUnit[], [] as GeochronologicUnit[])
      }
      if (this.storage?.length) {
        this.storageLocations = this.storage
          .map(({ location }) => location)
          .filter((loc, index, arr) => arr.indexOf(loc) === index)
      }
    })
  },
}).mixin(Slugified<Specimen>({}))
  .mixin(IPIKable)
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
