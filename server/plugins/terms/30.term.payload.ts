import { requireIf, StringValidator as String, validateBody } from "../../utils/api/payload"

export default defineMongooseReader(Term, async (body, options) => {
  const create = options?.op === `create`
  const { label } = await validateBody(body, {
    label: requireIf(create, String),
    type: requireIf(create, String),
  })

  return { label }
})
