export enum Cardinality {
  ONE = 1,
  MANY = 2
}

export interface EntityBodyReaderOptions {
  cardinality: Cardinality
}

export interface EntityHandlerOptions {
  page: number
  pageSize: number
  select: string[]
  sort: string[]
}
