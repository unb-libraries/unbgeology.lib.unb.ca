import { Status } from "@unb-libraries/nuxt-layer-entity"
import { Schema } from "mongoose"

export interface Stateful<T extends typeof Status> {
  status: T[keyof T]
}

export interface StatefulOptions<T extends typeof Status> {
  values: T
  default: T[keyof T]
}

export default <T extends typeof Status>(options: StatefulOptions<T>) => defineDocumentSchema<Stateful<T>, StatefulOptions<T>>(options => ({
  status: {
    type: Schema.Types.Mixed,
    required: true,
    enum: options.values,
    default: options.default,
  },
}))(options)
