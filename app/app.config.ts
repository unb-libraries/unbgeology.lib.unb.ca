import { type Specimen } from "types/specimen"
import { type Classification, type GeochronologicUnit, type StorageLocation } from "types/vocabularies"
import { type Affiliation, type Organization, type Person } from "types/affiliation"

export default defineAppConfig({
  entityTypes: {
    Specimen: {
      name: `Specimen`,
      baseURI: `/api/specimens`,
      uri(specimen) {
        return `/api/specimens/${(specimen as Specimen).slug}`
      },
    },

    Affiliation: {
      name: `Affiliation`,
      baseURI: `/api/affiliations`,
      uri(affiliation: Affiliation) {
        return `/api/affiliations/${affiliation.type}`
      },
      abstract: true,
    },

    Organization: {
      name: `Organization`,
      baseURI: `/api/affiliations/org`,
      uri(org: Organization) {
        return `/api/affiliations/org/${org.id}`
      },
      extends: `Affiliation`,
    },

    People: {
      name: `People`,
      baseURI: `/api/affiliations/people`,
      uri(person: Person) {
        return `/api/affiliations/people/${person.id}`
      },
      extends: `Affiliation`,
    },

    Classification: {
      name: `Classification`,
      baseURI: `/api/vocabularies/default/classification`,
      uri(classification: Classification) {
        return `/api/vocabularies/default/classification/${classification.id}`
      },
      extends: `TaxonomyTerm`,
    },

    Geochronology: {
      name: `Geochronology`,
      baseURI: `/api/vocabularies/default/geochronology`,
      uri(unit: GeochronologicUnit) {
        return `/api/vocabularies/default/geochronology/${unit.id}`
      },
      extends: `TaxonomyTerm`,
    },

    StorageLocation: {
      name: `StorageLocation`,
      baseURI: `/api/vocabularies/default/storagelocation`,
      uri(location: StorageLocation) {
        return `/api/vocabularies/default/storagelocation/${location.id}`
      },
      extends: `TaxonomyTerm`,
    },
  },
})
