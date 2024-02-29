import { Schema, type SchemaDefinition, type ObjectId, Model } from "mongoose"
import { type DocumentQuery } from "./entity"

export interface DocumentUpdate<D = any> {
  before: D
  after: D
}

export interface DocumentBase {
  readonly _id: ObjectId
  readonly created: Date
  readonly updated: Date
}

export interface DocumentSchema<D = any> {
  paths: SchemaDefinition<D>
  readonly schema: Schema<D>
  alterSchema: (schema: Schema<D>) => void
}

export type Document<D extends DocumentBase = DocumentBase> = {
  get: (path: keyof D) => D[keyof D]
  set: (path: keyof D, value: D[keyof D]) => Document<D>
  update: () => Promise<DocumentUpdate<Partial<D>>>
  delete: () => Promise<void>
}

export interface DocumentModel<D extends DocumentBase = DocumentBase> {
  name: string
  fullName: string
  base?: DocumentModel
  schema: DocumentSchema<D>
  mongoose: {
    model: Model<D>
  }
  find: () => DocumentQuery
  findByID: (id: ObjectId) => Promise<Document<D> | null>
  create: (body: D) => Promise<Document<D>>
}

export type AlterSchemaHandler<D = any> = (schema: Schema<D>) => void

export interface DocumentSchemaOptions<D = any> {
  alterSchema: AlterSchemaHandler<D>
}
