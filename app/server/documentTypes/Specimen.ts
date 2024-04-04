import { EntityFieldTypes } from "layers/mongo/types/entity"
import { Immeasurabibility, MeasurementType, ObjectIDType, Status } from "types/specimen"
import type { Entity, Stateful as IStateful } from "@unb-libraries/nuxt-layer-entity"
import type { Specimen as SpecimenEntity, Fossil as FossilEntity } from "types/specimen"
import type { DocumentBase } from "~/layers/mongo/types/schema"

interface Specimen extends Omit<SpecimenEntity, keyof Entity>, IStateful<typeof Status>, DocumentBase {
  classificationModel: string
  collectorModel: string
  sponsorModel: string
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
    required: optionalForStatus(Status.IMPORTED | Status.DRAFT),
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
    required: optionalForStatus(Status.IMPORTED | Status.DRAFT),
  },
  images: [{
    type: EntityFieldTypes.ObjectId,
    ref: `File.Image`,
    required: false,
  }],
  measurements: {
    type: [{
      type: {
        type: EntityFieldTypes.String,
        enum: MeasurementType,
        default: MeasurementType.INDIVIDUAL,
        required: true,
      },
      dimensions: {
        type: [EntityFieldTypes.Number],
      },
      reason: {
        type: EntityFieldTypes.String,
        enum: Immeasurabibility,
      },
    }],
    required: optionalForStatus(Status.IMPORTED | Status.DRAFT),
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
    type: {
      year: {
        type: EntityFieldTypes.Number,
        required: true,
      },
      month: {
        type: EntityFieldTypes.Number,
        required(this: Specimen) {
          return this.date?.day !== undefined
        },
      },
      day: {
        type: EntityFieldTypes.Number,
        required: false,
      },
    },
    required: false,
    validate: {
      validator: function (date: Specimen[`date`]) {
        return (date && (date.day === undefined || date.month !== undefined)) || true
      },
      message: `Month must be provided if day is provided.`,
    },
  },
  age: {
    relative: {
      type: EntityFieldTypes.ObjectId,
      ref: Geochronology.mongoose.model,
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
        min: -90,
        max: 90,
        required: optionalForStatus(Status.IMPORTED),
      },
      longitude: {
        type: EntityFieldTypes.Number,
        min: -180,
        max: 180,
        required: optionalForStatus(Status.IMPORTED),
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
    required: optionalForStatus(Status.IMPORTED | Status.DRAFT),
  },
  pieces: {
    type: EntityFieldTypes.Number,
    min: 1,
    required: optionalForStatus(Status.IMPORTED | Status.DRAFT),
  },
  partial: {
    type: EntityFieldTypes.Boolean,
    required: optionalForStatus(Status.IMPORTED | Status.DRAFT),
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
      type: {
        type: EntityFieldTypes.String,
        enum: [`in`, `out`],
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
          validate: {
            validator: function (email: string) {
              return email.match(/^.+@.+\..+$/)
            },
            message: `Invalid email address`,
          },
        },
        phone: {
          type: EntityFieldTypes.String,
          required: true,
          validate: {
            validator: function (phone: string) {
              return phone.match(/^[\d-() ]+$/)
            },
            message: `Invalid phone number`,
          },
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
    }],
    validate: [
      function (loans: Specimen[`loans`]) {
        return !loans || loans.every(loan => loan.start <= loan.end)
      },
      `Loan start date must precede end date.`,
    ],
  },
  storage: {
    type: [{
      location: {
        type: EntityFieldTypes.ObjectId,
        ref: StorageLocation.mongoose.model,
        required: true,
      },
      dateIn: EntityFieldTypes.Date,
      dateOut: EntityFieldTypes.Date,
    }],
    validate: [
      {
        validator: function (this: Specimen, storage: Specimen[`storage`]) {
          return storage.length < 1 || this.status === Status.IMPORTED || !storage.slice(1).some(s => s.dateIn === undefined)
        },
        message: `Each entry must provide an incoming date.`,
      },
      {
        validator: function (this: Specimen, storage: Specimen[`storage`]) {
          return storage.length > 0 && storage.reverse().slice(1).some(s => s.dateOut === undefined)
        },
        message: `Each but the most recent entry must provide an outgoing date.`,
      },
      {
        validator: function (this: Specimen, storage: Specimen[`storage`]) {
          return storage.every(s => !s.dateOut || s.dateIn <= s.dateOut)
        },
        message: `Each entry's incoming date must precede its outgoing date.`,
      },
      {
        validator: function (this: Specimen, storage: Specimen[`storage`]) {
          return storage.slice(1).every((s, i) => s.dateIn >= storage[i].dateOut!)
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
  editor: {
    type: EntityFieldTypes.ObjectId,
    ref: User.mongoose.model,
    required: optionalForStatus(Status.IMPORTED),
  },
}).mixin(State)())

const Fossil = defineDocumentModel(`Fossil`, defineDocumentSchema<Omit<FossilEntity, `type` | `classification` | keyof Entity> & Specimen>({
  portion: {
    type: EntityFieldTypes.ObjectId,
    ref: FossilPortion.mongoose.model,
    required: optionalForStatus(Status.IMPORTED | Status.DRAFT),
  },
})(), Specimen)

const Mineral = defineDocumentModel(`Mineral`, defineDocumentSchema({

})(), Specimen)

const Rock = defineDocumentModel(`Rock`, defineDocumentSchema({

})(), Specimen)

export default {
  Specimen,
  Fossil,
  Mineral,
  Rock,
}
