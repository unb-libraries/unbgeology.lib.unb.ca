import { EntityDocument } from "layers/mongo/types/entity"
import { type Classification } from "types/vocabularies"

type ClassificationTaxonomy = EntityDocument<Classification>

export default defineTaxonomy<ClassificationTaxonomy>(`Classification`)
