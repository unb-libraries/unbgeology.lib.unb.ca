export default defineEventHandler(async (event) => {
  const storage = useStorage(`db`)
  return await storage.getItem(`specimens`)
})
