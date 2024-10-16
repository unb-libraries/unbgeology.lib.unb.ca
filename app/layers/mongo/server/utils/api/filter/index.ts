import type { QueryOptions, FilterableQuery } from "../../../../types/entity"
import Boolean from "./boolean"
import Count from "./count"
import Date from "./date"
import Enum from "./enum"
import Numeric from "./numeric"
import ObjectID from "./objectid"
import String from "./string"
import type { DocumentBase } from "~/layers/mongo/types/schema"

export type QueryCondition = [QueryOptions[`filter`][number][1], QueryOptions[`filter`][number][2]]
export type Filter = <D extends DocumentBase = DocumentBase>(query: FilterableQuery<D>) => void

export {
  Count,
  Boolean,
  Date,
  Enum,
  Numeric,
  ObjectID,
  String,
}
