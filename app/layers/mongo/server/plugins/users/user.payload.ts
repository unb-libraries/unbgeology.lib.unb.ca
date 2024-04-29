export default defineMongooseReader(User, async (payload, { op }) => {
  const create = op === `create`
  return await validateBody(payload, {
    username: requireIf(create, StringValidator),
    active: optional(BooleanValidator),
    profile: optional(ObjectValidator({
      firstName: optional(StringValidator),
      lastName: optional(StringValidator),
      email: optional(StringValidator),
      phone: optional(StringValidator),
    })),
  })
})
