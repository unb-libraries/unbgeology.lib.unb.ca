import { type DocumentQuery, type QueryOptions } from "../../../../types/entity"
import Date from "./date"
import Numeric from "./numeric"
import ObjectID from "./objectid"
import String from "./string"

export type QueryCondition = [QueryOptions[`filter`][number][1], QueryOptions[`filter`][number][2]]
export type Filter = (query: DocumentQuery) => void

export {
  Date,
  Numeric,
  ObjectID,
  String,
}
