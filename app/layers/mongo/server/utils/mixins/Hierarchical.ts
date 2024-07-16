import { Document, Schema } from "mongoose"
import type { DocumentBase } from "~/layers/mongo/types/schema"

export interface Hierarchical<T> {
  parent?: Hierarchical<T> & T
  ancestors: (Hierarchical<T> & T)[]
  parentModel: string
}

export default <T extends DocumentBase>(options?: { sort: keyof Omit<T, keyof DocumentBase | keyof Hierarchical<T>> }) => defineDocumentSchema<Hierarchical<T>>({
  parent: {
    type: Schema.Types.ObjectId,
    required: false,
    refPath: `parentModel`,
  },
  ancestors: [{
    type: Schema.Types.ObjectId,
    required: true,
    refPath: `parentModel`,
  }],
  parentModel: {
    type: Schema.Types.String,
    required: true,
    immutable: true,
    default(this: Document) {
      return this.model().modelName
    },
  },
}, {
  alterSchema(schema) {
    schema.pre(`save`, async function () {
      const Model = this.model()
      if (!this.isNew) {
        const original = await Model.findById(this._id)
        this.$locals.original = original
      }
      if (this.parent) {
        const parent = await Model.findById(this.parent)
        if (!parent) {
          throw new Error(`Parent not found`)
        }
        this.ancestors = [this.parent, ...parent.ancestors]
      } else {
        this.ancestors = []
      }
    })

    schema.post(`save`, async function () {
      const Model = this.model()
      const original = this.$locals.original as Hierarchical<T>
      if (original && original.parent !== this.parent) {
        await Model.updateMany({ ancestors: this._id }, { $pullAll: { ancestors: original.ancestors } })
        await Model.updateMany({ ancestors: this._id }, { $push: { ancestors: { $each: this.ancestors } } })
      }
    })

    schema.post(`deleteOne`, { document: true, query: false }, async function () {
      await this.model().deleteMany({ ancestors: this._id })
    })
  },
})()
