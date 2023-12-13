import { type Classification as IClassification, type Rock as IRock, type Mineral as IMineral, type Fossil as IFossil } from "types/vocabularies/classification"

export const Classification = defineTaxonomy<IClassification>(`Classification`)
export const Rock = defineTaxonomy<IRock>(`Rock`)
export const Mineral = defineTaxonomy<IMineral>(`Mineral`)
export const Fossil = defineTaxonomy<IFossil>(`Fossil`)
