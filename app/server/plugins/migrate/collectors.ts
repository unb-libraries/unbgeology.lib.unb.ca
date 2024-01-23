import type { EntityJSONBody } from "@unb-libraries/nuxt-layer-entity"
import { type Person, Pronouns, Title } from "~/types/affiliation"

interface PersonItem {
  name: string
  first_name: string
  last_name: string
  gender: `M` | `F` | `N`
  titles: string[]
  occupation: string
  bio: string[]
  website: string
}

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook(`migrate:import:item`, useMigrateHandler<PersonItem, Person>(`People`, (data) => {
    let { first_name: firstName, last_name: lastName } = data
    const { name, gender, titles, occupation, bio, website } = data
    if (gender === `N` && (!firstName || firstName === `Unknown`)) {
      return null
    } else if (gender !== `N` && !firstName) {
      [firstName, lastName] = name.split(` `)
    }

    const title = titles
      .map(title => title.toLowerCase().trim())
      .map(title => title.match(/(dr|phd)\.?/)
        ? Title.DR
        : title.match(/prof(\.?|essor)/)
          ? Title.PROF
          : Title.NONE)
      .filter(title => title !== Title.NONE)
      .filter((title, index, arr) => arr.indexOf(title) === index)
      .reduceRight((sum, title) => sum | title, 0)

    const body: EntityJSONBody<Person> = {
      firstName,
      lastName,
      pronouns: gender === `M` ? Pronouns.HE : gender === `F` ? Pronouns.SHE : Pronouns.THEY,
      title: title > Title.NONE ? title : gender === `M` ? Title.MR : gender === `F` ? Title.MS : Title.NONE,
      occupation,
      bio: bio.join(`\n`),
    }

    if (website) {
      body.contact = {
        web: website,
      }
    }

    return body
  }))
})
