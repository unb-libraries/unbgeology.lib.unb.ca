import { type Specimen } from "~~/types/specimen"

export default defineEventHandler(async (event) => {
  const storage = useStorage(`db`)
  const id = event.context.params!.id

  const specimens = (await storage.getItem(`specimens`) || []) as Specimen[]
  const index = specimens.findIndex(s => s.id === id)
  const specimen = specimens[index]

  if (specimen) {
    const properties: { [prop: string]: any} = await readBody(event)
    specimens[index] = { ...specimen, ...properties }
    await storage.setItem(`specimens`, specimens)
  }

  return specimen
})
