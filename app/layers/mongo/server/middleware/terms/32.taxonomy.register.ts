export default defineEventHandler(async (event) => {
  const { pathname } = getRequestURL(event)
  if (pathname.match(/^\/api\/terms/)) {
    await import(`../../documentTypes/TaxonomyTerm`)
  }
})
