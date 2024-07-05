import { type Composition } from "~/types/composition"

interface MComposition {
  label: string
  type: string
}

export default defineMigrateHandler<MComposition, Composition>(`Term.Composition`, (data) => {
  const { label, type } = data
  return {
    label: label[0].toUpperCase() + label.slice(1).toLowerCase(),
    type: `composition/${type.toLowerCase()}`,
  }
})
