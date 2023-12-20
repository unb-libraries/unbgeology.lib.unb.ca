export default defineEventHandler(async (event) => {
  const body = await readEntityBody(event, termBodyReader)

  if (Array.isArray(body)) {
    return await TermBase.insertMany(body)
  } else {
    return await TermBase.create(body)
  }
})
