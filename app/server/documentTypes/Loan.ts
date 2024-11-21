import type { Entity } from "@unb-libraries/nuxt-layer-entity"
import { EntityFieldTypes } from "~/layers/mongo/types/entity"
import type { DocumentBase as IDocumentBase } from "~/layers/mongo/types/schema"
import type { Loan as LoanEntity } from "types/loan"

export interface Loan extends Omit<LoanEntity, keyof Entity | `start` | `end`>, IDocumentBase {
  start: number
  end: number
}

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
  specimens: {
    type: [EntityFieldTypes.ObjectId],
    ref: `Specimen`,
    required: true,
  }
  contract: {
    type: EntityFieldTypes.ObjectId,
    ref: `File`,
    required: false,
  },
}).mixin(DocumentBase()))
