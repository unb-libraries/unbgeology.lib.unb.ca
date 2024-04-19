import { Status } from "~/types/affiliate"

export default defineMongooseReader(Affiliate.Organization, async (payload, options) => {
  if (options.op === `create` && payload.type !== `affiliate/organization`) { return {} }

  const create = options.op === `create`
  const { status } = await validateBody(payload, {
    status: optional(EnumValidator(Status)),
  })

  const migrate = status === Status.MIGRATED
  const { address, contact } = await validateBody(payload, {
    address: requireIf(create && !migrate, ObjectValidator({
      line1: requireIf(create, StringValidator),
      line2: optional(StringValidator),
      city: requireIf(create, StringValidator),
      state: optional(StringValidator),
      postalCode: requireIf(create, StringValidator),
      country: requireIf(create, StringValidator),
    })),
    contact: requireIf(create && !migrate, ObjectValidator({
      name: requireIf(create, StringValidator),
      email: requireIf(create, StringValidator),
      phone: requireIf(create, StringValidator),
    })),
    web: optional(ArrayValidator(StringValidator)),
  })

  return {
    address: address && {
      ...address,
      postalCode: address.postalCode?.replace(/\s/g, ``),
    },
    contact: contact && {
      ...contact,
      phone: contact.phone?.replace(/[^\d+]/g, ``),
    },
    status: status && useEnum(Status).valueOf(status),
    type: Affiliate.Organization.fullName,
  }
})
