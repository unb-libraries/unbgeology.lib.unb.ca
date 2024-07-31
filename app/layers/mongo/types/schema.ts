import { Schema, type SchemaDefinition, type Model, type ObjectId } from "mongoose"
import { type DocumentFindQuery, type DocumentDeleteQuery, type DocumentUpdateQuery, type DocumentIDQuery, type DocumentFindOneQuery, type DocumentUpdateOneQuery, type DocumentDeleteOneQuery } from "./entity"
import { type Mutable } from "."

export interface DocumentUpdate<D = any> {
  before: D
  after: D
}

export interface DocumentBase {
  readonly _id: ObjectId
  readonly __type: string
  schemaVersion: number
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

type CreateBody<D extends DocumentBase = DocumentBase> = Omit<D, keyof DocumentBase>
export interface DocumentModel<D extends DocumentBase = DocumentBase> {
  name: string
  fullName: string
  base?: DocumentModel
  schema: DocumentSchema<D>
  mongoose: {
    model: Model<D>
  }
  find: () => DocumentFindQuery<D>
  findOne: () => DocumentFindOneQuery<D>
  findByID: (id: string) => DocumentIDQuery<D>
  search: (term: string) => DocumentFindQuery<D>
  create: <T extends CreateBody<D> | CreateBody<D>[]>(body: T) => Promise<T extends CreateBody<D> ? D : T extends CreateBody<D>[] ? D[] : D | D[]>
  update: (body: Partial<Mutable<D>>) => DocumentUpdateQuery<D>
  updateOne: (body: Partial<Mutable<D>>) => DocumentUpdateOneQuery<D>
  updateByID: (id: string, body: Partial<Mutable<D>>) => DocumentUpdateOneQuery<D>
  delete: () => DocumentDeleteQuery<D>
  deleteOne: () => DocumentDeleteOneQuery<D>
  deleteByID: (id: string) => DocumentDeleteOneQuery<D>
}

export type AlterSchemaHandler<D = any> = (schema: Schema<D>) => void

export interface DocumentSchemaOptions<D = any> {
  alterSchema: AlterSchemaHandler<D>
}
