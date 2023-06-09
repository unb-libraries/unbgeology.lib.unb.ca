interface Dimension {
  width: number
  height: number
}

interface Specimen {
  id: string
  name: string
  description: string
  dimension: Dimension
  date?: Date
  age: string
  pieces: number
  partial: boolean
  composition: string
  status: `draft` | `review` | `published`
  created: number
  modified: number
}

export { Specimen, Dimension }
