import { Schema } from "mongoose"

export interface Authorize {
  authTags: string[]
}

export interface AuthorizeOptions<T = any> {
  type: string
  paths: (keyof T | ((doc: T) => string))[]
}

export default <T = any>(options: AuthorizeOptions<T>) => defineDocumentSchema<Authorize>({
  authTags: {
    type: [Schema.Types.String],
    required: false,
  },
}, {
  alterSchema(schema) {
    schema.pre(`save`, function (this: Authorize & T) {
      this.authTags = options.paths
        .map(path => typeof path === `function` ? path(this) : `${this[path]}`)
        .map(tag => `${options.type}:${tag}`)
    })
  },
})()
