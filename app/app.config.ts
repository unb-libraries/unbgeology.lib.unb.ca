import { type Specimen } from "types/specimen"

export default defineAppConfig({
  entityTypes: {
    Specimen: {
      name: `Specimen`,
      baseURI: `/api/specimens`,
      uri(specimen) {
        return `/api/specimens/${(specimen as Specimen).slug}`
      },
    },

    Term: {
      name: `Term`,
      baseURI: `/api/terms`,
      uri(term) {
        return `/api/terms/${term.id}`
      },
      abstract: true,
    },
  },
})
