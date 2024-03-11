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
  // update: () => Promise<DocumentUpdate<Partial<D>>>
  delete: () => Promise<void>
  save: () => Promise<void>
} & D
type DocumentRequest<D extends DocumentBase = DocumentBase> = {
  select: (...fields: string[]) => DocumentRequest<D>
  then: (resolve: (document: Document<D>) => void, reject: (err: any) => void) => void
}

export interface DocumentModel<D extends DocumentBase = DocumentBase> {
  name: string
  fullName: string
  base?: DocumentModel
  schema: DocumentSchema<D>
  mongoose: {
    model: Model<D>
  }
  find: () => DocumentQuery<D>
  findByID: (id: string) => DocumentRequest<D>
  create: (body: D | D[]) => Promise<Document<D> | Document<D>[]>
}

export type AlterSchemaHandler<D = any> = (schema: Schema<D>) => void

export interface DocumentSchemaOptions<D = any> {
  alterSchema: AlterSchemaHandler<D>
}
