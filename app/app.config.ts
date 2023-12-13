import { type Specimen } from "types/specimen"
import { type StorageLocation } from "types/vocabularies"
import { type Unit } from "types/vocabularies/geochronology"
import { type Classification as RockClassification, type Portion as RockPortion } from "types/vocabularies/rock"
import { type Classification as MineralClassification, type Portion as MineralPortion } from "types/vocabularies/mineral"
import { type Classification as FossilClassification, type Portion as FossilPortion } from "types/vocabularies/fossil"
import { type Affiliation, type Organization, type Person } from "types/affiliation"

export default defineAppConfig({
  entityTypes: {
    "Specimen": {
      name: `Specimen`,
      baseURI: `/api/specimens`,
      uri(specimen) {
        return `/api/specimens/${(specimen as Specimen).slug}`
      },
    },

    "Affiliation": {
      name: `Affiliation`,
      baseURI: `/api/affiliations`,
      uri(affiliation: Affiliation) {
        return `/api/affiliations/${affiliation.type}`
      },
      abstract: true,
    },

    "Organization": {
      name: `Organization`,
      baseURI: `/api/affiliations/org`,
      uri(org: Organization) {
        return `/api/affiliations/org/${org.id}`
      },
      extends: `Affiliation`,
    },

    "People": {
      name: `People`,
      baseURI: `/api/affiliations/people`,
      uri(person: Person) {
        return `/api/affiliations/people/${person.id}`
      },
      extends: `Affiliation`,
    },

    "Rock.Classification": {
      name: `Rock.Classification`,
      baseURI: `/api/terms/rock/classification`,
      uri(classification: RockClassification) {
        return `/api/terms/rock/classification/${classification.id}`
      },
      extends: `TaxonomyTerm`,
    },

    "Rock.Portion": {
      name: `Rock.Portion`,
      baseURI: `/api/terms/rock/portion`,
      uri(portion: RockPortion) {
        return `/api/terms/rock/portion/${portion.id}`
      },
      extends: `Term`,
    },

    "Mineral.Classification": {
      name: `Mineral.Classification`,
      baseURI: `/api/terms/mineral/classification`,
      uri(classification: MineralClassification) {
        return `/api/terms/mineral/classification/${classification.id}`
      },
      extends: `TaxonomyTerm`,
    },

    "Mineral.Portion": {
      name: `Mineral.Portion`,
      baseURI: `/api/terms/mineral/portion`,
      uri(portion: MineralPortion) {
        return `/api/terms/mineral/portion/${portion.id}`
      },
      extends: `Term`,
    },

    "Fossil.Classification": {
      name: `Fossil`,
      baseURI: `/api/terms/fossil/classification`,
      uri(classification: FossilClassification) {
        return `/api/terms/fossil/classification/${classification.id}`
      },
      extends: `TaxonomyTerm`,
    },

    "Fossil.Portion": {
      name: `Fossil`,
      baseURI: `/api/terms/fossil/portion`,
      uri(portion: FossilPortion) {
        return `/api/terms/fossil/portion/${portion.id}`
      },
      extends: `Term`,
    },

    "Geochronology": {
      name: `Geochronology`,
      baseURI: `/api/terms/geochronology/unit`,
      uri(unit: Unit) {
        return `/api/terms/geochronology/unit/${unit.id}`
      },
      extends: `TaxonomyTerm`,
    },

    "StorageLocation": {
      name: `StorageLocation`,
      baseURI: `/api/terms/default/storagelocation`,
      uri(location: StorageLocation) {
        return `/api/terms/default/storagelocation/${location.id}`
      },
      extends: `TaxonomyTerm`,
    },
  },
})
