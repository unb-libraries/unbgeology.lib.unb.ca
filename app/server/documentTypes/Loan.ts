import type { Entity } from "@unb-libraries/nuxt-layer-entity"
import type { Loan as LoanEntity } from "types/loan"
import type { Specimen } from "./Specimen"
import { EntityFieldTypes } from "~/layers/mongo/types/entity"
import type { DocumentBase as IDocumentBase } from "~/layers/mongo/types/schema"

export interface Loan extends Omit<LoanEntity, keyof Entity | `start` | `end` | `specimens`>, IDocumentBase {
  start: number
  end: number
}

export interface Specimen_Loan extends IDocumentBase {
  loan: Loan
  specimen: Specimen
  id?: string
  url?: string
}

export defineDocumentModel(`Specimen_Loan`, defineDocumentSchema<Specimen_Loan>({
  loan: {
    type: EntityFieldTypes.ObjectId,
    ref: `Loan`,
    required: true,
  },
  specimen: {
    type: EntityFieldTypes.ObjectId,
    ref: `Specimen`,
    required: true,
  },
  id: {
    type: EntityFieldTypes.String,
    required: false,
  },
  url: {
    type: EntityFieldTypes.String,
    required: false,
  },
}).mixin(DocumentBase()))

export default defineDocumentModel(`Loan`, defineDocumentSchema<Loan>({
  description: {
    type: EntityFieldTypes.String,
    required: false,
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
  contract: {
    type: EntityFieldTypes.ObjectId,
    ref: `File`,
    required: false,
  },
}).mixin(DocumentBase()))
