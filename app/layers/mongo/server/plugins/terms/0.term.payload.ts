import { requireIf, StringValidator as String, validateBody } from "../../utils/api/payload"
import { type Term as ITerm } from "../../documentTypes/Term"
import { type DocumentBase } from "~/layers/mongo/types/schema"
import { type Payload } from "~/layers/mongo/types/entity"

export default defineBodyReader<Payload<Omit<ITerm, keyof DocumentBase | `slug`>>>(Term, async (body, options) => {
  const create = options?.op === `create`
  return await validateBody(body, {
    type: requireIf(create, String),
    label: requireIf(create, String),
  })
})
