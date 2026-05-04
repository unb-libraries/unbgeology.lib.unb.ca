import type { Specimen } from "types/specimen"
import { type Term, type File, type User, type Migration } from "@unb-libraries/nuxt-layer-entity"

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
    },

    Loan: {
      name: `Loan`,
      baseURI: `/api/loans`,
      uri(loan) {
        return `/api/loans/${loan.id}`
      },
    },

    Migration: {
      name: `Migration`,
      baseURI: `/api/migrations`,
      uri(migration) {
        return `/api/migrations/${migration.id}`
      },
    },

    TermBase: {
      name: `TermBase`,
      baseURI: `/api/terms`,
      uri(term: Term) {
        const [domain, type] = term.type.split(`.`)
        return `/api/terms/${domain}/${type}/${term.id}`
      },
      abstract: true,
    },

    TaxonomyTerm: {
      name: `TaxonomyTerm`,
      baseURI: `/api/terms`,
      uri(term: Term) {
        const [domain, type] = term.type.split(`.`)
        return `/api/terms/${domain}/${type}/${term.id}`
      },
      extends: `TermBase`,
    },

    File: {
      name: `File`,
      baseURI: `/api/files`,
      uri(file: File) {
        return `/api/files/${file.type ?? `other`}/${file.id}`
      },
      abstract: true,
    },

    Image: {
      name: `Image`,
      baseURI: `/api/files/image`,
      uri(file: File) {
        return `/api/files/image/${file.id}`
      },
      extends: `File`,
    },

    Document: {
      name: `Document`,
      baseURI: `/api/files/document`,
      uri(file: File) {
        return `/api/files/document/${file.id}`
      },
      extends: `File`,
    },

    User: {
      name: `User`,
      baseURI: `/api/users`,
      uri(user: User) {
        return `/api/users/${user.username}`
      },
    },
  },
})
