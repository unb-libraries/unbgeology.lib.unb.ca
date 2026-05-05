import { EntityFieldTypes } from "../../../types/entity"

export interface IPIKable {
  ipik: number
}

export default defineDocumentSchema<IPIKable>({
  ipik: {
    type: EntityFieldTypes.Number,
    required: false,
    // TODO: Set immutable after all data is migrated
    // immutable: true,
  },
}, {
  alterSchema(schema) {
    schema.pre(`save`, async function () {
      if (this.isNew) {
        this.ipik = await createIPIK(this.collection.collectionName)
      }
    })
  },
})()
