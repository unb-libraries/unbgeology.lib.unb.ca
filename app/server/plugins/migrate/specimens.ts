import type { EntityJSONBody, TaxonomyTerm } from "@unb-libraries/nuxt-layer-entity"
import { ObjectIDType, Category, type ObjectID, type Specimen, MeasurementType, Unmeasurability } from "~/types/specimen"

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
  }[],
  // Ore? and others?
  // Ore to be imported as "Rock", leave note
  // "Mineral; Rock" or "Rock; Mineral" -> Rock
  type: string
  // Some may not exist
  // Some may be in reverse order
  classification: string[]
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
  created: string
  updated: string
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook(`migrate:import:item`, useMigrateHandler<MimsySpecimen, Specimen>(`Specimen`, async (item, { sourceID: sourceIDLookup, entity: entityLookup }) => {
    const { unb_id: unbID, other_ids: legacyIDs, type, classification: classifications, description, pieces, partial, measurements, origin, collected, collector_ids: collectorIDs, publications, created } = item

    let category
    if (type.toLowerCase().match(/rock|ore/)) {
      category = Category.ROCK
    } else if (type.toLowerCase().match(/fossil/)) {
      category = Category.FOSSIL
    } else if (type.toLowerCase().match(/mineral/)) {
      category = Category.MINERAL
    }

    if (!category) {
      throw new Error(`Unknown specimen type: ${type}`)
    }

    const unbObjectID = { id: unbID, type: ObjectIDType.LEGACY, source: `Mimsy` }
    const legacyObjectIDs = legacyIDs?.map(lid => ({
      id: lid.id,
      type: ObjectIDType.LEGACY,
      source: lid.source ?? lid.type ?? ``,
    })) ?? []

    const body: EntityJSONBody<Specimen> = {
      objectIDs: [unbObjectID, ...legacyObjectIDs],
      category,
      description,
      pieces,
      partial: partial !== null && !partial.toLowerCase().includes(`whole`),
      created: new Date(created).valueOf(),
    }

    if (Array.isArray(classifications) && classifications.length > 0) {
      const classification = await entityLookup<TaxonomyTerm>((classification) => {
        return classification.label === classifications.at(-1)
      }, category === Category.FOSSIL ? `Fossil.Classification` : category === Category.MINERAL ? `Mineral.Classification` : `Rock.Classification`)

      if (classification) {
        body.classification = classification
      }
    }

    if (measurements !== null && !measurements.toLowerCase().match(/^(unknown|unmeasur|microscopic|too )/)) {
      const parsed = measurements.split(`;`).map((m) => {
        const [prefix, ...dimensions] = m.replace(/cm|:|x/g, ``).replace(/\s+/g, ` `).trim().split(` `)
        const map: [string, MeasurementType][] = [
          [`small`, MeasurementType.SMALLEST],
          [`large`, MeasurementType.LARGEST],
          [`average`, MeasurementType.AVERAGE],
          [`container`, MeasurementType.CONTAINER],
        ]
        const type = map.find(([keyword]) => prefix.toLowerCase().includes(keyword))?.[1] ?? MeasurementType.INDIVIDUAL
        return {
          type,
          dimensions: dimensions.map(d => parseFloat(d) * 10),
        }
      })
      if (parsed.length > 0) {
        body.measurements = parsed
      }
    } else if (measurements !== null && !measurements.toLowerCase().match(/^unknown/)) {
      if (measurements.toLowerCase().includes(`microscopic`)) {
        body.unmeasureable = Unmeasurability.TOO_SMALL
      } else if (measurements.toLowerCase().includes(`too fragile`)) {
        body.unmeasureable = Unmeasurability.TOO_FRAGILE
      } else if (measurements.toLowerCase().includes(`too many`)) {
        body.unmeasureable = Unmeasurability.TOO_MANY
      } else if (measurements.toLowerCase().includes(`unmeasur`)) {
        body.unmeasureable = Unmeasurability.OTHER
      }
    }

    if (origin !== null) {
      const { place: name, site: description } = origin
      body.origin = { name, description }
    }

    if (collected !== null && collected.toLowerCase() !== `unknown`) {
      const parsed = collected
        .replace(/[?.,]/g, ``)
        .replace(/(\d)(st|nd|rd|th)/g, `$1`)
        .replace(/\b\d\b/g, `0$&`)

      const yearOnly = /^\d{4}$/
      const yearMonth = /^\d{4}-\d{2}$|^\w+ \d{4}$/

      const date = new Date(parsed)
      if (parsed.match(yearOnly)) {
        body.date = { year: date.getFullYear() }
      } else if (parsed.match(yearMonth)) {
        body.date = { year: date.getFullYear(), month: date.getMonth() + 1 }
      } else if (date.toString() !== `Invalid Date`) {
        body.date = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() }
      }
    }

    if (collectorIDs !== null && collectorIDs.length > 0) {
      for (const collectorID of collectorIDs) {
        let collector
        try {
          collector = await sourceIDLookup(collectorID, `People`)
        } catch (err: any) {
          collector = await sourceIDLookup(collectorID, `Organization`)
        }
        if (collector) {
          body.collector = collector
          break
        }
      }
    }

    if (Array.isArray(publications)) {
      const publicationsWithCitation = publications.filter(publication => publication.citation)
      if (publicationsWithCitation.length > 0) {
        body.publications = publicationsWithCitation.map((publication) => {
          const { citation, abstract, url } = publication
          const publicationBody = { citation }
          if (abstract !== null) {
            publicationBody.abstract = abstract
          }
          if (url !== null) {
            publicationBody.doi = url
          }
          return publicationBody
        })
      }
    }

    return body
  }))
})
