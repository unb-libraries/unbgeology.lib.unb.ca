import { type TaxonomyTerm as TaxonomyTermEntity } from "@unb-libraries/nuxt-layer-entity"
import { readTerm } from "../utils/api/terms"
import { type TaxonomyTerm as TaxonomyTermDocument } from "../documentTypes/TaxonomyTerm"

export default defineEventHandler(async (event) => {
  const { pathname } = getRequestURL(event)
  if (pathname.startsWith(`/api/terms`)) {
    await import(`../documentTypes/TaxonomyTerm`)
    readTerm.merge<TaxonomyTermEntity, TaxonomyTermDocument>((body) => {
      const { parent, type } = body
      const documentBody = {
        parent,
        type: type === `taxonomy` ? `Term.TaxonomyTerm` : undefined,
      }
      return documentBody
    })

    const { select, sort } = getQueryOptions(event)
    const defaultFields = [
      `parent`,
    ]

    addMongooseField(event, `__l`, `__r`, ...(select.length > 0
      ? select.filter(field => defaultFields.includes(field))
      : defaultFields))

    if (sort.length > 0) {
      sort.forEach(([field, asc]) => {
        switch (field) {
          case `parent`: asc
            ? addMongooseSortField(event, [`__l`, true])
            : addMongooseSortField(event, [`__r`, false]); break
          default: addMongooseSortField(event, [field, asc])
        }
      })
    }
  }
})
