import { requireIf, StringValidator as String, validateBody } from "../../utils/api/payload"

export default defineMongooseReader(Term, async (body, options) => {
  const create = options?.op === `create`
  return await validateBody(body, {
    type: requireIf(create, String),
    label: requireIf(create, String),
  })
})
