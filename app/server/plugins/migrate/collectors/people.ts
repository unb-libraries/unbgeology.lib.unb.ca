import { type Person, Pronouns, Title } from "~/types/affiliate"

interface Collector {
  name: string
  first_name: string
  last_name: string
  gender: `M` | `F` | `N`
  titles: string[]
  occupation: string
  bio: string[]
  website: string
}

export default defineMigrateHandler<Collector, Person>(`Term`, (data, item) => {
  let { first_name: firstName, last_name: lastName } = data
  const { name, gender, titles, occupation, bio, website } = data

  if (gender === `N` && (!firstName || firstName === `Unknown`)) {
    return null
  } else if (gender !== `N` && !firstName) {
    [firstName, lastName] = name.split(` `)
  }

  const title = (titles ?? [])
    .map(title => title.toLowerCase().trim())
    .map(title => (title.match(/(dr|phd)\.?/) && Title.DR) || (title.match(/prof(\.?|essor)/) && Title.PROF))
    .filter(title => title)
    .filter((title, index, arr) => arr.indexOf(title) === index)
    .reduceRight((sum, title) => sum | title!, 0)

  return {
    label: `${lastName}, ${firstName} `,
    firstName,
    lastName,
    pronouns: (gender === `M` && Pronouns.HE) || (gender === `F` && Pronouns.SHE) || Pronouns.THEY,
    title: (title !== 0 && title) || undefined,
    occupation: occupation || undefined,
    bio: bio?.join(`\n`),
    web: website && [website],
    type: `person`,
  }
})
