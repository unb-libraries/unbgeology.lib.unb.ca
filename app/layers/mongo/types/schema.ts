import { Schema, type SchemaDefinition, type ObjectId, type Model, type Document } from "mongoose"
import { type DocumentQuery } from "./entity"
import { type Mutable } from "."

export interface DocumentUpdate<D = any> {
  before: D
  after: D
}

export interface DocumentBase {
  readonly _id: ObjectId
  readonly created: number
  readonly updated: number
}

export interface DocumentSchema<D = any> {
  paths: SchemaDefinition<D>
  readonly schema: Schema<D>
  alterSchema: (schema: Schema<D>) => void
}

export type ObjectProperties<T extends object = object> = Pick<T, {
  [K in keyof T]: T[K] extends Function ? never : K
}[keyof T]>

export interface DocumentModel<D extends DocumentBase = DocumentBase> {
  name: string
  fullName: string
  base?: DocumentModel
  schema: DocumentSchema<D>
  mongoose: {
    model: Model<D>
  }
  find: () => DocumentQuery<D>
  findOne: () => DocumentQuery<D, `findOne`>
  findByID: (id: string) => Pick<DocumentQuery<D, `findOne`>, `select` | `use` | `then`>
  create: (body: Omit<D, keyof DocumentBase> | Omit<D, keyof DocumentBase>[]) => Document<D> | Document<D>[]
  update: (id: string, body: Partial<Mutable<D>>) => Promise<[D, D]>
  delete: (id: string) => Promise<void>
}

export type AlterSchemaHandler<D = any> = (schema: Schema<D>) => void

export interface DocumentSchemaOptions<D = any> {
  alterSchema: AlterSchemaHandler<D>
}
