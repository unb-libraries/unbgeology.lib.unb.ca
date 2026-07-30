import type { QueryOptions, FilterableQuery } from "../../../../app/types/entity"
import { BooleanFilter } from "./boolean"
import { CountFilter } from "./count"
import { DateFilter } from "./date"
import { EnumFilter } from "./enum"
import { NumericFilter } from "./numeric"
import { ObjectIDFilter } from "./objectid"
import { StringFilter } from "./string"
import type { DocumentBase } from "~~/types/schema"

export type QueryCondition = [QueryOptions[`filter`][number][1], QueryOptions[`filter`][number][2]]
export type Filter = <D extends DocumentBase = DocumentBase>(query: FilterableQuery<D>) => void

export {
  CountFilter,
  BooleanFilter,
  DateFilter,
  EnumFilter,
  NumericFilter,
  ObjectIDFilter,
  StringFilter,
}
