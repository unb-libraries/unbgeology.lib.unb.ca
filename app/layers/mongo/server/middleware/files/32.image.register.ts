export default defineEventHandler(async (event) => {
  const { pathname } = getRequestURL(event)
  if (pathname.match(/^\/api\/files/)) {
    await import(`../../documentTypes/Image`)
  }
})
