import { consola } from "consola"
import type { Image, EntityJSONList } from "@unb-libraries/nuxt-layer-entity"
import type { Classification } from "~/types/classification"
import { Category, type Specimen, MeasurementCount, Immeasurabibility, type ObjectID } from "~/types/specimen"
import type { Composition } from "~/types/composition"
import type { Unit } from "~/types/geochronology"

// New field: Collection (vocabulary)

interface MimsySpecimen {
  // any update on what to do with IDs? Use new format, but keep old
  unb_id: string
  // explain difference between type and source again?
  // a lot of records seem to have only an ID, no type, no source
  other_ids: {
    id: string
    type: string | null // null = "unknown"
    source: string | null
  }[]
  // Ore? and others?
  // Ore to be imported as "Rock", leave note
  // "Mineral; Rock" or "Rock; Mineral" -> Rock
  type: string
  // Some may not exist
  // Some may be in reverse order
  classification: string[]
  name: string
  description: string
  // a lot of them seem to only have thumbnails
  images: string[]
  // I have not looked at that one yet (can we map it easily?)
  // Early -> Lower; Late -> Upper
  // Convert field to optionally accept ranges
  age: string | null
  // Minerals: Override value set by term? Only sometimes? When?
  // Rocks: Don't rocks contain minerals? Choose formula of Mineral? -> No formula, use different vocabulary to describe compositions
  // Fossils: true form/in rock/print in rock; provide rock type if applicable
  composition: string | null
  pieces: number
  // This does not seem to be a boolean; keep it that way?
  partial: string
  // Parse string as best as possible
  // How to adapt interface for different measurements?
  // Small number of pieces: each piece's measurement
  // High number: smallest/largest/average piece's measurements?
  // Microscopic/Fractured: no measurements?
  measurements: string | null
  // only fossils? -> optional for rocks,minerals
  // not migrated
  portion: string
  // Can only provide name, coordinates to be set manually
  origin: {
    place_raw: string | null
    place: string[]
    site: string | null
  }
  collected: string
  // Are person data correcly mapped?
  collector_ids: number[] | null
  // Cannot figure out how to map sponsors
  // Create people stub with just names for sponsors
  sponsor: number | null
  publications: {
    citation: string
    abstract: string | null
    url: string | null
  }[]
  location_history: {
    name: string[]
    date: string
  }[] | null
  created: string
  creator: string
  updated: string
  editor: string
}

function getAuthHeaders(): { Cookie?: string } {
  const event = useEvent()
  if (event) {
    const sessionName = useRuntimeConfig().public.session.name
    return { Cookie: `${sessionName}=${getCookie(event, sessionName)}` }
  }
  return {}
}

export default defineMigrateHandler<MimsySpecimen, Specimen>(`Specimen`, async (data, { sourceID, migration: { dependencies } }) => {
  const { unb_id: unbID, other_ids: legacyIDs, type, classification: classifications, name, description, images, pieces, composition, age, partial, measurements, origin, collected, collector_ids: collectorIDs, publications, location_history: storage, created, creator, updated, editor } = data
  const headers = getAuthHeaders()

  const category = type?.toLowerCase().match(/rock|ore/)
    ? Category.ROCK
    : type?.toLowerCase().match(/fossil/)
      ? Category.FOSSIL
      : type?.toLowerCase().match(/mineral/)
        ? Category.MINERAL
        : undefined

  return {
    objectIDs: unbID && [{ id: `UNB-${unbID}`, type: `Mimsy` }, ...(legacyIDs ?? []).map<ObjectID>(lid => ({
      id: lid.id,
      type: lid.type ?? lid.source ?? undefined,
    }))],
    type: category,
    classification: classifications && category && await (async () => {
      if (!Array.isArray(classifications) || classifications.length < 1) return null
      for (const classification of classifications.reverse()) {
        const classificationEntities = await $fetch<EntityJSONList<Classification>>(`/api/terms`, {
          query: {
            filter: [
              `label:equals:${classification}`,
              `type:equals:classification/${category}`,
            ],
          },
          headers,
        })
        if (classificationEntities?.entities.length > 0) {
          return classificationEntities?.entities[0]?.self
        }
      }
      return null
    })(),
    name: name && (name !== `Unknown` ? name : null),
    description,
    images: images && unbID && await (async () => {
      try {
        const [year, index] = unbID.split(`-`).map(n => n.replace(/^0+/, ``))
        const pattern = `^[0-9a-z]{24}-(UNB)?${year}-0*${index}[a-z]?([- ].*)?\\.JPG$`
        const { entities: files } = await $fetch<EntityJSONList<Image>>(`/api/files`, { query: { filter: [`filename:match:${pattern}`] }, headers })
        // console.log(unbID, pattern, files.length)
        return files.map(({ self }) => self)
      } catch (err: unknown) {
        consola.error(`Failed to fetch images for specimen ${unbID}: ${(err as Error).message}`)
        return null
      }
    })(),
    date: collected && ((collected.toLowerCase() !== `unknown` && (() => {
      const parsed = collected
        .replace(/[?.,]/g, ``)
        .replace(/(\d)(st|nd|rd|th)/g, `$1`)
        .replace(/\b\d\b/g, `0$&`)

      const yearOnly = /^\d{4}$/
      const yearMonth = /^\d{4}-\d{2}$|^\w+ \d{4}$/

      const date = new Date(parsed)
      return (parsed.match(yearOnly)
        ? [date.getFullYear()]
        : parsed.match(yearMonth)
          ? [date.getFullYear(), date.getMonth() + 1]
          : date.toString() !== `Invalid Date`
            ? [date.getFullYear(), date.getMonth() + 1, date.getDate()]
            : []).join(`-`)
    })()) || null),
    composition: composition && await (async () => {
      const findTerm = async (term: string) => (await $fetch<EntityJSONList<Composition>>(`/api/terms`, {
        query: {
          filter: [
            `label:equals:${term}`,
            `type:equals:composition/${category}`,
          ],
        },
        headers,
      }))?.entities[0]?.self
      const terms = (await Promise.all(composition?.replace(/ and | or |\/|;|\?/g, `,`).split(`,`)
        .filter(c => c.length > 0)
        .map(c => c[0].toUpperCase() + c.slice(1).toLowerCase())
        .map(c => c.trim())
        .map(findTerm) ?? []))
        .filter(c => typeof c === `string`)
      return terms.length > 0 ? terms : null
    })(),
    age: age && await (async () => {
      const unitEntities = await $fetch<EntityJSONList<Unit>>(`/api/terms`, {
        query: {
          filter: [
            `type:equals:geochronology`,
            ...age?.split(` to `).map(t => t.replaceAll(`?`, ``)).map(t => `label:equals:${t}`) ?? [],
          ],
        },
        headers,
      })
      return unitEntities?.entities?.sort(({ start: a }, { start: b }) => b - a).slice(0, 2).map(t => t.self) ?? null
    })(),
    measurements: measurements && (() => {
      if (!measurements || measurements.match(/^unknown/i)) return null
      if (measurements.match(/^(unmeasur|microscopic|too)/)) {
        return {
          count: MeasurementCount.IMMEASURABLE,
          reason: measurements.toLowerCase().includes(`microscopic`)
            ? Immeasurabibility.TOO_SMALL
            : measurements.toLowerCase().includes(`too fragile`)
              ? Immeasurabibility.TOO_FRAGILE
              : measurements.toLowerCase().includes(`too many`)
                ? Immeasurabibility.TOO_MANY
                : Immeasurabibility.OTHER,
        }
      } else {
        const sla = [`small`, `large`, `average`]
        const parsed = measurements.split(`;`)
          .map(m => m.replace(/cm|:|x/g, ``).replace(/\s+/g, ` `).trim().split(` `))
          .map(measurements => [
            [...measurements].reverse().slice(3).reverse().join(` `),
            ...measurements.slice(-3).map(e => e.startsWith(`.`) ? `0${e}` : e).map(e => Number(e) * 10).map(e => isNaN(e) ? 0 : e),
          ]) as [string, number, number, number][]

        const count = parsed.filter(([prefix]) => sla.includes(prefix)).length
          ? MeasurementCount.AGGREGATE
          : parsed.filter(([prefix]) => prefix === `container`).length
            ? MeasurementCount.CONTAINER
            : MeasurementCount.INDIVIDUAL
        return {
          count,
          dimensions: count === MeasurementCount.AGGREGATE
            ? parsed.filter(([pfx]) => sla.includes(pfx)).sort(([a], [b]) => sla.indexOf(a) - sla.indexOf(b)).map(([, ...dimensions]) => dimensions)
            : count === MeasurementCount.CONTAINER
              ? [measurements.split(`;`).find(([pfx]) => pfx === `container`)!.slice(1)]
              : parsed.map(([, ...dimensions]) => dimensions),
        }
      }
    })(),
    pieces,
    partial: partial && !partial.toLowerCase().includes(`whole`),
    origin: origin && {
      name: origin?.place?.join(`, `) ?? origin.place_raw ?? ``,
      description: origin.site,
    },
    collector: collectorIDs && ((collectorIDs.length && await (async () => {
      const collectorsMigration = dependencies.find(m => m.entityType === `Term.Affiliate`)
      if (!collectorsMigration) throw new Error(`Collectors migration not found`)
      for (const collectorID of collectorIDs) {
        const collector = await useMigrationLookup(collectorsMigration, `${collectorID}`)
        if (collector) {
          return collector
        }
      }
    })()) || null),
    publications: publications && ((Array.isArray(publications) && (() => {
      return publications.map((publication, i) => {
        const { citation, abstract, url } = publication
        const id = (citation?.substring(0, citation?.indexOf(`,`) > 0 ? citation?.indexOf(`,`) : 10)) || `${i}`
        return { id, citation: citation || url || undefined, abstract: abstract || undefined, doi: url || undefined }
      })
    })()) || null),
    storage: storage && ((await Promise.all(storage.map(async (loc) => {
      const storageMigration = dependencies.find(m => m.entityType === `Term.StorageLocation`)
      if (!storageMigration) throw new Error(`Storage locations' migration not found`)

      const { name: labels, date: dateIn } = loc
      const sourceID = labels.join(`|`).toLowerCase()
      const location = sourceID && await useMigrationLookup(storageMigration, sourceID)
      return { location, dateIn }
    }))).filter(({ location }) => location) || null),
    created: created && (new Date(created).toISOString() || null),
    creator: creator && await (async () => {
      const userEntities = await $fetch(`/api/users`, { query: { filter: [`username:equals:${creator.toLowerCase()}`] }, headers })
      return userEntities?.entities[0]?.self ?? null
    })(),
    updated: updated && (new Date().toISOString() ?? null),
    editor: editor && await (async () => {
      const { user } = useCurrentServerSession(useEvent()).data
      const userEntities = await $fetch(`/api/users`, { query: { filter: [`username:equals:${user}`] }, headers })
      return userEntities?.entities[0]?.self ?? null
    })(),
  }
})
