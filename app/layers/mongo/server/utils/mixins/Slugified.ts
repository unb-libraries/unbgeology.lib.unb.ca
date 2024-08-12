import slugify from "slugify"
import { Schema, type Document } from "mongoose"
import { type Slugified as ISlugified } from "@unb-libraries/nuxt-layer-entity"

export type Slugified = ISlugified
type SlugifyablePath<D = any> = Omit<keyof D, keyof ISlugified>
type SlugifyableDocument<D = any> = Document<Omit<D, keyof ISlugified>>
export interface SlugifiedOptions<D = any> {
  immutable: boolean
  syncOnUpdate: boolean
  path: SlugifyablePath<D> | SlugifyablePath<D>[] | ((doc: SlugifyableDocument<D>) => string | Promise<string>)
  unique: boolean
}

async function createSlug<D = any>(doc: Document<D>, path: SlugifiedOptions<D>[`path`]) {
  const slug = typeof path === `function`
    ? await path(doc)
    : typeof path === `string`
      ? `${doc.get(path)}`
      : (path as SlugifyablePath[]).map(p => doc.get(`${p}`)).join(` `)
  return slugify(slug, { lower: true, strict: true })
}

export default <T = any>(options: Partial<SlugifiedOptions<T>>) => defineDocumentSchema<ISlugified, Partial<SlugifiedOptions<T>>>((options) => {
  const { immutable = false, unique = false } = options
  return {
    slug: {
      type: Schema.Types.String,
      required: false,
      unique,
      immutable,
    },
  }
}, {
  alterSchema(schema) {
    schema.pre(`save`, async function () {
      const { path = `_id`, syncOnUpdate = false, immutable = false } = options
      if (this.isNew || (!immutable && syncOnUpdate)) {
        this.slug = await createSlug(this as unknown as Document<T>, path)
      }
    })
  },
})(options)
