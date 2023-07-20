import { type Classification } from "~/server/entityTypes/Classification"

export default defineEventHandler(async (event) => {
  const classifications: Classification[] = await readBody(event)
  for (const classification of classifications) {
    await $fetch(`/api/classifications`, {
      method: `POST`,
      body: classification,
    })
  }
  return null
})
