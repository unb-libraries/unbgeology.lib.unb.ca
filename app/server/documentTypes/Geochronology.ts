import { EntityFieldTypes } from "layers/mongo/types/entity"
import { type Unit, Status, Division } from "types/geochronology"
import { type Term as TermEntity } from "@unb-libraries/nuxt-layer-entity"
import { type Term as ITerm } from "~/layers/mongo/server/documentTypes/Term"

export type GeochronologicUnit = Omit<Unit, keyof TermEntity> & ITerm

const State = Stateful({
  values: Status,
  default: Status.DRAFT,
})

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
