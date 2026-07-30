import { EntityFieldTypes } from "~~/types/entity"
import { type Unit, Status, Division } from "types/geochronology"
import { type Term as TermEntity } from "@unb-libraries/nuxt-layer-entity"
import { type Term as ITerm, renderTerm } from "#server/documentTypes/Term"
import { renderHierarchical } from "#server/utils/mixins/Hierarchical"

export type GeochronologicUnit = Omit<Unit, keyof TermEntity> & ITerm

const State = Stateful({
  values: Status,
  default: Status.DRAFT,
})

export function renderUnit(unit: GeochronologicUnit) {
  return {
    ...renderTerm(unit),
    ...renderHierarchical(unit, renderUnit),
    division: String(useEnum(Division).labelOf(unit.division)).toLowerCase(),
    start: unit.start,
    gssp: unit.gssp,
    uncertainty: unit.uncertainty,
    color: unit.color,
  }
}

export default defineDocumentModel(`GeochronologicUnit`, defineDocumentSchema<GeochronologicUnit>({
  division: {
    type: EntityFieldTypes.Number,
    enum: Division,
    required: true,
  },
  start: {
    type: EntityFieldTypes.Number,
    required: true,
  },
  gssp: {
    type: EntityFieldTypes.Boolean,
    default: false,
  },
  uncertainty: {
    type: EntityFieldTypes.Number,
    required: false,
    default: 0,
  },
  color: {
    type: EntityFieldTypes.String,
    required: false,
  },
}).mixin(Hierarchical<GeochronologicUnit>({ sort: `label` }))
  .mixin(State)
  .mixin(Authorize<GeochronologicUnit>({
    paths: (unit) => {
      const status = useEnum(Status).labelOf(unit.status).toLowerCase()
      return [
        `term`,
        `term:${status}`,
        `term:geochronology`,
        `term:geochronology:${status}`,
      ]
    },
  }))(), Term)
