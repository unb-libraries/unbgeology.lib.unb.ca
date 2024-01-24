import { type Organization } from "~/types/affiliation"

interface Collector {
  name: string
  first_name: string
  gender: `M` | `F` | `N`
}

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook(`migrate:import:item`, useMigrateHandler<Collector, Organization>(`Organization`, (data) => {
    const { name, first_name: firstName, gender } = data
    if (gender !== `N` || firstName) {
      return null
    }

    return { name }
  }))
})
