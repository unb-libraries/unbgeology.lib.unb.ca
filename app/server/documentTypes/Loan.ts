import { Types } from "mongoose"
import { encode } from "ufo"
import LoanMeta from "./LoanMeta"
import type { Entity } from "@unb-libraries/nuxt-layer-entity"
import { LoanType, type Loan as LoanEntity } from "types/loan"
import type { Specimen } from "./Specimen"
import { EntityFieldTypes } from "~/layers/mongo/types/entity"
import type { DocumentBase as IDocumentBase } from "~/layers/mongo/types/schema"
import type { File } from "~/layers/mongo/server/documentTypes/FileBase"

export interface Loan extends Omit<LoanEntity, keyof Entity | `start` | `end` | `subjects` | `contract`>, IDocumentBase {
  start: number
  end: number
  subjects: Array<{
    specimen: Specimen
    foreignID: string
    url: string
  }>
  contract: File
}

export default defineDocumentModel(`Loan`, defineDocumentSchema<Loan>({
  type: {
    type: EntityFieldTypes.Number,
    required: true,
    enum: LoanType,
    default: LoanType.INCOMING,
  },
  start: {
    type: EntityFieldTypes.Number,
    required: true,
  },
  end: {
    type: EntityFieldTypes.Number,
    required: true,
    validate: [{
      validator: function (this: Loan) {
        return this.start <= this.end
      },
      message: `End date must be past start date.`,
    }],
  },
  description: {
    type: EntityFieldTypes.String,
    required: false,
  },
  contact: {
    type: {
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
    required: true,
  },
  subjects: {
    type: [{
      specimen: {
        type: EntityFieldTypes.ObjectId,
        ref: `Specimen`,
        required: true,
      },
      foreignID: {
        type: EntityFieldTypes.String,
        required: false,
      },
      url: {
        type: EntityFieldTypes.String,
        required: false,
      },
    }],
    required: true,
  },
  contract: {
    type: EntityFieldTypes.ObjectId,
    ref: `File`,
    required: false,
  },
}, {
  alterSchema: (schema) => {
    schema.set(`toJSON`, {
      transform: ({ _id, slug, description, start, end, contact, subjects, contract, type }: Partial<Loan>) => ({
        self: `/api/loans/${_id}`,
        id: slug,
        description,
        start: start && new Date(start).toISOString(),
        end: end && new Date(end).toISOString(),
        contact: contact && {
          name: contact.name,
          affiliation: contact.affiliation,
          email: contact.email,
          phone: contact.phone,
        },
        subjects: subjects?.map(({ specimen, foreignID, url }) => ({
          specimen: !(specimen instanceof Types.ObjectId)
            ? {
                self: `/api/specimens/${specimen.slug}`,
                id: specimen.slug,
                name: specimen.name,
              }
            : undefined,
          foreignID,
          url,
        })),
        contract: contract && {
          self: `/api/files/${contract._id}`,
          id: contract._id,
          filename: contract.filename,
          uri: contract.filename && encode(`/upload/${contract.filename}`),
        },
        type: type && useEnum(LoanType)
          .labelOf(type)
          .toLowerCase(),
      }),
    })
  },
}).mixin(Slugified<Loan>({
  async path(loan) {
    const year = new Date(loan.get(`start`)).getFullYear()
    const { yearCounter: map } = await LoanMeta.mongoose.model
      .findOneAndUpdate({ name: loan.collection.collectionName }, {
        $inc: {
          [`yearCounter.${year}`]: 1,
        },
      }, {
        upsert: true,
        returnDocument: `after`,
      })
      .select(`yearCounter`)
    const counter = String(map.get(`${year}`)).padStart(2, `0`)
    return `${year}-${counter}`
  },
}))
  .mixin(DocumentBase())())
