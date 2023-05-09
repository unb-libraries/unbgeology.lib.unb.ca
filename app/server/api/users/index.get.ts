export default defineEventHandler(async (event) => {
  return await useStorage(`db`).getItem(`users`) || {}
})
