import { type Term, type File, type User } from "layers/base/types/entity"

export default defineAppConfig({
  entityTypes: {
    TermBase: {
      name: `TermBase`,
      baseURI: `/api/terms`,
      uri(term: Term) {
        const [domain, type] = term.type.split(`.`)
        return `/api/terms/${domain}/${type}/${term.id}`
      },
      abstract: true,
    },

    Term: {
      name: `Term`,
      baseURI: `/api/terms`,
      uri(term: Term) {
        const [domain, type] = term.type.split(`.`)
        return `/api/terms/${domain}/${type}/${term.id}`
      },
      extends: `TermBase`,
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
        return `/api/files/${file.type}/${file.id}`
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
