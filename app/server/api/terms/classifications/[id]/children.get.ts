import type { Classification as IClassification } from "~/types/classification"
import type { Classification } from "~/server/documentTypes/Classification"

const queryFields = [`self`, `label`, `slug`, `rank`, `composition`, `parents`, `parents.id`, `parents.label`, `depth`, `status`, `created`, `updated`, `type`]

export default defineEventHandler(async (event) => {
  const { page, pageSize, select } = getEntityQueryParams(event, queryFields)
  const { id } = getRouterParams(event)

  const resources = getAuthorizedResources(event, r => /^term(:classification)?(:[a-z]+)*$/.test(r))
  const authFields = getAuthorizedFields(event, ...resources)

  const fields = select
    ?.filter((field, i, arr) => arr.indexOf(field) === i)
    .filter(field => !authFields.length || authFields.includes(field)) ?? []

  if (resources.length < 1) {
    return create403()
  }

  const classification = await Term.mongoose.model.findOne().where("_id").equals(id)
  if (!classification) {
    return create404()
  } else if (classification && !classification.authTags.some(t => resources.includes(t))) {
    return create403()
  }

  const [{ documents: parents, total: [total = 0] }] = await Term.mongoose.model.aggregate<{ documents: Classification[], total: [number] }>()
    .match({ ancestors: classification._id, authTags: { $in: resources } })
    .facet({ documents: [{ $skip: (page - 1) * pageSize }, { $limit: pageSize }], total: [{ $count: `count` }] })
    .project({ documents: 1, total: { $ifNull: ["$total.count", 0]} })

  return {
      self: `/api/terms/${id}/children`,
      entities: parents
        .map(renderClassification)
        .map(specimen => Object
          .fromEntries(Object
            .entries(specimen)
              .filter(([key]) => key === `self` || !fields.length || fields.includes(key as keyof IClassification))),),
      ...usePaginator({ total }),
    }
})
