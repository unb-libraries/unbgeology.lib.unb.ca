import { Status } from "~/types/affiliate"

export default defineMongooseReader(Affiliate.Organization, async (payload, options) => {
  if (options.op === `create` && payload.type !== `affiliate/organization`) { return {} }

  const create = options.op === `create`
  const { status } = await validateBody(payload, {
    status: optional(EnumValidator(Status)),
  })

  const { address, contact, web } = await validateBody(payload, {
    // REFACTOR: Require line1,city,postalCode,country
    address: optional(ObjectValidator({
      line1: optional(StringValidator),
      line2: optional(StringValidator),
      city: optional(StringValidator),
      state: optional(StringValidator),
      postalCode: optional(StringValidator),
      country: optional(StringValidator),
    })),
    // REFACTOR: Require name
    contact: optional(ObjectValidator({
      name: optional(StringValidator),
      email: optional(StringValidator),
      phone: optional(StringValidator),
    })),
    web: optional(ArrayValidator(StringValidator)),
  })

  return {
    address: address && {
      ...address,
      postalCode: address.postalCode && address.postalCode?.replace(/\s/g, ``),
    },
    contact: contact && {
      ...contact,
      phone: contact.phone && contact.phone?.replace(/[^\d+]/g, ``),
    },
    web,
    status: status && useEnum(Status).valueOf(status),
    type: Affiliate.Organization.fullName,
  }
})
