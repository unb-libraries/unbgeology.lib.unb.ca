import { z, ZodError } from "zod"
import type { H3Event } from "h3"
import type { File as IFile, Entity } from "@unb-libraries/nuxt-layer-entity"
import { LoanType, type Loan } from "~/types/loan"
import type { Specimen as ISpecimen } from "~/types/specimen"

interface LoanPayload extends Omit<Loan, keyof Entity | `start` | `end` | `specimens` | `contract`> {
  start: number
  end: number
  specimens: string[]
  contract?: string
}

interface ReadLoanBodyOptions {
  optional: boolean
}

export async function readLoanBody<T extends ReadLoanBodyOptions = { optional: false }>(event: H3Event, options?: Partial<T>): Promise<T[`optional`] extends false ? LoanPayload : Partial<LoanPayload>> {
  const schema = z.object({
    description: z.string()
      .optional(),
    start: z.string().date()
      .transform(date => new Date(date).valueOf()),
    end: z.string().date()
      .transform(date => new Date(date).valueOf()),
    contact: ((schema: Parameters<typeof z[`object`]>[0]) => options?.optional ? z.object(schema).partial() : z.object(schema))({
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
    type: z.string()
      .regex(/incoming|outgoing/i)
      .transform(t => useEnum(LoanType).valueOf(t as LoanType | `incoming` | `outgoing`))
      .optional(),
  })

  return await readValidatedBody(event, async (body) => {
    try {
      return await (options?.optional ? schema.partial().parseAsync(body) : schema.parseAsync(body)) as T[`optional`] extends false ? LoanPayload : Partial<LoanPayload>
    } catch (error: unknown) {
      throw new Error(error instanceof ZodError ? `"${error.issues[0].path}": ${error.issues[0].message}` : `Invalid payload.`)
    }
  })
}
