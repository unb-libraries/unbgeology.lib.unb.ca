import { Schema, type SchemaDefinition, type ObjectId, type Model, type Document } from "mongoose"
import { type DocumentFindQuery, type DocumentDeleteQuery, type DocumentUpdateQuery } from "./entity"
import { type Mutable } from "."

export interface DocumentUpdate<D = any> {
  before: D
  after: D
}

export interface DocumentBase {
  readonly _id: ObjectId
  readonly __type: string
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
  find: () => DocumentFindQuery<D>
  findOne: () => DocumentFindQuery<D, `findOne`>
  findByID: (id: string) => Pick<DocumentFindQuery<D, `findOne`>, `select` | `use` | `then`>
  create: (body: Omit<D, keyof DocumentBase> | Omit<D, keyof DocumentBase>[]) => Promise<Document<D> | Document<D>[]>
  update: (body: Partial<Mutable<D>>) => DocumentUpdateQuery<D>
  updateOne: (body: Partial<Mutable<D>>) => DocumentUpdateQuery<D, `findOne`>
  updateByID: (id: string, body: Partial<Mutable<D>>) => DocumentUpdateQuery<D, `findOne`>
  delete: () => DocumentDeleteQuery<D>
  deleteOne: () => DocumentDeleteQuery<D, `findOne`>
  deleteByID: (id: string) => DocumentDeleteQuery<D, `findOne`>
}

export type AlterSchemaHandler<D = any> = (schema: Schema<D>) => void

export interface DocumentSchemaOptions<D = any> {
  alterSchema: AlterSchemaHandler<D>
}
