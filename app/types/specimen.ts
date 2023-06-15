import { type Entity } from "./entity"

enum SpecimenStatus {
  DRAFT = `draft`,
  REVIEW = `review`,
  PUBLISHED = `published`,
}

interface Dimension {
  width: number
  height: number
}

interface Specimen extends Entity {
  objectId: string
  name: string
  description?: string
  dimensions?: Dimension
  date?: Date
  age?: string
  pieces?: number
  partial?: boolean
  composition?: string
  status: SpecimenStatus
}

export { Specimen, Dimension, SpecimenStatus }
