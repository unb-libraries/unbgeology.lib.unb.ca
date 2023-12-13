import { type Specimen } from "types/specimen"
import { type StorageLocation } from "types/vocabularies"
import { type Unit } from "types/vocabularies/geochronology"
import { type Rock, type Mineral, type Fossil } from "types/vocabularies/classification"
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

    Rock: {
      name: `Rock`,
      baseURI: `/api/terms/default/rock`,
      uri(rock: Rock) {
        return `/api/terms/default/rock/${rock.id}`
      },
      extends: `TaxonomyTerm`,
    },

    Mineral: {
      name: `Mineral`,
      baseURI: `/api/terms/default/mineral`,
      uri(mineral: Mineral) {
        return `/api/terms/default/mineral/${mineral.id}`
      },
      extends: `TaxonomyTerm`,
    },

    Fossil: {
      name: `Fossil`,
      baseURI: `/api/terms/default/fossil`,
      uri(fossil: Fossil) {
        return `/api/terms/default/fossil/${fossil.id}`
      },
      extends: `TaxonomyTerm`,
    },

    Geochronology: {
      name: `Geochronology`,
      baseURI: `/api/terms/geochronology/unit`,
      uri(unit: Unit) {
        return `/api/terms/geochronology/unit/${unit.id}`
      },
      extends: `TaxonomyTerm`,
    },

    StorageLocation: {
      name: `StorageLocation`,
      baseURI: `/api/terms/default/storagelocation`,
      uri(location: StorageLocation) {
        return `/api/terms/default/storagelocation/${location.id}`
      },
      extends: `TaxonomyTerm`,
    },
  },
})
