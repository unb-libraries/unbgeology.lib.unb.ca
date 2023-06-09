import { type Specimen } from "~~/types/specimen"

export default defineEventHandler(async (event) => {
  const storage = useStorage(`db`)
  const id = event.context.params!.id

  const specimens = (await storage.getItem(`specimens`) || []) as Specimen[]
  const specimen = specimens.find(s => s.id === id)

  if (specimen) {
    return specimen
  }
})
