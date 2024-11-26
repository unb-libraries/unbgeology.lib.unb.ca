import { z, ZodError } from "zod"
import type { H3Event } from "h3"
import type { File as IFile, Entity } from "@unb-libraries/nuxt-layer-entity"
import type { Loan } from "~/types/loan"
import type { Specimen as ISpecimen } from "~/types/specimen"

interface LoanPayload extends Omit<Loan, keyof Entity | `start` | `end` | `specimens` | `contract`> {
  start: number
  end: number
  specimens: string[]
  contract?: string
}

export async function readLoanBody(event: H3Event) {
  const schema = z.object({
    description: z.string()
      .optional(),
    start: z.string().date()
      .transform(date => new Date(date).valueOf()),
    end: z.string().date()
      .transform(date => new Date(date).valueOf()),
    contact: z.object({
      name: z.string(),
      affiliation: z.string(),
      email: z.string().email(),
      phone: z.string(),
    }),
    specimens: z.array(
      z.string().regex(/\/api\/specimens\/unb-\d{4}-\d{4}/)
        .transform(async uri => await $fetchWithSession<ISpecimen>(event)(uri))
        .transform(async ({ id }) => await Specimen.Base?.mongoose.model.findOne({ slug: id }))
        .transform(doc => `${doc!._id}`),
    ),
    contract: z.string()
      .regex(/\/api\/files\/[a-z0-9]{24}/)
      .transform(async uri => await $fetchWithSession<IFile>(event)(uri))
      .transform(async ({ id }) => await FileBase.mongoose.model.findById(id))
      .transform(doc => `${doc!._id}`)
      .optional(),
  })

  return await readValidatedBody<LoanPayload>(event, async (body) => {
    try {
      return await schema.parseAsync(body)
    } catch (error: unknown) {
      throw new Error(error instanceof ZodError ? `"${error.issues[0].path}": ${error.issues[0].message}` : `Invalid payload.`)
    }
  })
}
