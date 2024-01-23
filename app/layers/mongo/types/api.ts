export enum EntityBodyCardinality {
  ONE = 1,
  MANY = 2
}

export interface EntityBodyReaderOptions {
  cardinality: EntityBodyCardinality
}
