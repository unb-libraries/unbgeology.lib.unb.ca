import { type Organization } from "~/types/affiliate"

interface Collector {
  name: string
  first_name: string
  gender: `M` | `F` | `N`
}

export default defineMigrateHandler<Collector, Organization>(`Organization`, (data) => {
  const { name, first_name: firstName, gender } = data
  if (gender !== `N` || firstName) {
    return null
  }

  return { name }
})
