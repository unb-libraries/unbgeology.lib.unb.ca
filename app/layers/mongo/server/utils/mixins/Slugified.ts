import { Schema } from "mongoose"
import slugify from "slugify"
import { type Slugified as ISlugified } from "@unb-libraries/nuxt-layer-entity"

export type Slugified = ISlugified
export interface SlugifiedOptions<D = any> {
  path?: Omit<keyof D, keyof ISlugified> | Omit<keyof D, keyof ISlugified>[] | ((doc: Omit<D, keyof ISlugified>) => string)
}

export default <T = any>(options?: Partial<SlugifiedOptions<T>>) => defineDocumentSchema<ISlugified, Partial<SlugifiedOptions<T>>>(options => ({
  slug: {
    type: Schema.Types.String,
    required: options?.path !== undefined,
    default() {
      if (!options.path) {
        return ``
      }
      return slugify(typeof options.path === `function`
        ? options.path(this)
        : Array.isArray(options.path)
          ? options.path.map(path => `${this[path as keyof T]}`).join(` `)
          : `${this[options.path as keyof T]}`, { lower: true, strict: true })
    },
  },
}))(options ?? {})
