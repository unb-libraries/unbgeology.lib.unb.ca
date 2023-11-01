import { type Classification } from "types/taxonomy"
import { EntityDocument } from "~/layers/mongo/types/entity"

type ClassificationTaxonomy = EntityDocument<Classification>

export default defineTaxonomyType<ClassificationTaxonomy>(`Classification`)
