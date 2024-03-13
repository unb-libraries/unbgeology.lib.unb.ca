import { Status } from "@unb-libraries/nuxt-layer-entity"
import { Schema, type Document } from "mongoose"
import type {
  Stateful as IStateful,
  StatefulOptions,
} from "../../types/mixins"

export const Stateful = <T extends typeof Status>(options: StatefulOptions<T>) => defineDocumentSchema<IStateful<T>, StatefulOptions<T>>(options => ({
  status: {
    type: Schema.Types.Mixed,
    required: true,
    enum: options.values,
    default: options.default,
  },
}))(options)
