import { Schema } from "mongoose"

export interface Authorize {
  authTags: string[]
}

export interface AuthorizeOptions<T = any> {
  paths: keyof T | (keyof T)[] | ((doc: T) => string | string[])
}

export default <T = any>(options: AuthorizeOptions<T>) => defineDocumentSchema<Authorize>({
  authTags: {
    type: [Schema.Types.String],
    required: false,
  },
}, {
  alterSchema(schema) {
    schema.pre(`save`, function (this: Authorize & T) {
      const authTags = typeof options.paths === `function`
        ? options.paths(this)
        : typeof options.paths === `string`
          ? `${this[options.paths]}`
          : (options.paths as (keyof T)[]).map(path => `${this[path]}`)
      this.authTags = Array.isArray(authTags) ? authTags : [authTags]
    })
  },
})()
