export default defineBodyReader(async (payload, { type }) => {
  if (type?.toLowerCase() !== `userauth`) { return {} }
  return await validateBody(payload, {
    roles: optional(ArrayValidator(StringValidator)),
  })
})
