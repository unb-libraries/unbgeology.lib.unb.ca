import type { QueryOptions, FilterableQuery } from "../../../../types/entity"
import Date from "./date"
import Numeric from "./numeric"
import ObjectID from "./objectid"
import String from "./string"
import type { DocumentBase } from "~/layers/mongo/types/schema"

export type QueryCondition = [QueryOptions[`filter`][number][1], QueryOptions[`filter`][number][2]]
export type Filter = <D extends DocumentBase = DocumentBase>(query: FilterableQuery<D>) => void

export {
  Date,
  Numeric,
  ObjectID,
  String,
}
