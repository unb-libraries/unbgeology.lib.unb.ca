export default defineEventHandler(async (event) => {
  const { pathname } = getRequestURL(event)
  if (pathname.match(/^\/api\/terms/)) {
    await Promise.all([
      `../../documentTypes/Affiliate`,
      `../../documentTypes/Classification`,
      `../../documentTypes/Geochronology`,
      `../../documentTypes/Portion`,
      `../../documentTypes/StorageLocation`,
    ].map(path => import(path)))
  }
})
