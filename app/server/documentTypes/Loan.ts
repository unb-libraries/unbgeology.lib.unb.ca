import type { Entity } from "@unb-libraries/nuxt-layer-entity"
import type { Loan as LoanEntity } from "types/loan"
import type { Specimen } from "./Specimen"
import { EntityFieldTypes } from "~/layers/mongo/types/entity"
import type { DocumentBase as IDocumentBase } from "~/layers/mongo/types/schema"
import type { ObjectID } from "~/types/specimen"
import type { File } from "~/layers/mongo/server/documentTypes/FileBase"

export interface Loan extends Omit<LoanEntity, keyof Entity | `start` | `end` | `specimens`>, IDocumentBase {
  start: number
  end: number
  specimens: ObjectID[]
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
  specimens: [{
    type: EntityFieldTypes.ObjectId,
    ref: `Specimen`,
    required: true,
  }],
  contract: {
    type: EntityFieldTypes.ObjectId,
    ref: `File`,
    required: false,
  },
}, {
  alterSchema: (schema) => {
    schema.set(`toJSON`, {
      transform: ({ _id, description, start, end, contact, specimens, contract }: Partial<Omit<Loan, `specimens` | `contract`> & { specimens: Specimen[], contract: File }>) => ({
        self: `/api/loans/${_id}`,
        id: `${_id}`,
        description,
        start: start && new Date(start).toISOString(),
        end: end && new Date(end).toISOString(),
        contact: contact && {
          name: contact.name,
          affiliation: contact.affiliation,
          email: contact.email,
          phone: contact.phone,
        },
        specimens: specimens?.map(({ slug }) => ({ self: `/api/specimens/${slug}`, id: slug })),
        contract: contract && { self: `/api/files/${contract._id}`, id: contract._id },
      }),
    })
  },
}).mixin(DocumentBase())())
