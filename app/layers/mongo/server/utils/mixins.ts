import { Status } from "@unb-libraries/nuxt-layer-entity"
import slugify from "slugify"
import { Schema, type Document } from "mongoose"
import type {
  Slugified as ISlugified,
  SlugifiedOptions,
  Stateful as IStateful,
  StatefulOptions,
} from "../../types/mixins"

export const Slugified = <T = any>(options: SlugifiedOptions<T>) => defineDocumentSchema<ISlugified, SlugifiedOptions<T>>(options => ({
  slug: {
    type: Schema.Types.String,
    required: true,
    unique: true,
    default() {
      return slugify(typeof options.path === `function`
        ? options.path(this)
        : Array.isArray(options.path)
          ? options.path.map(path => `${this[path as keyof T]}`).join(` `)
          : `${this[options.path as keyof T]}`, { lower: true, strict: true })
    },
  },
}))(options)

export const Stateful = <T extends typeof Status>(options: StatefulOptions<T>) => defineDocumentSchema<IStateful<T>, StatefulOptions<T>>(options => ({
  status: {
    type: Schema.Types.Mixed,
    required: true,
    enum: options.values,
    default: options.default,
  },
}))(options)
