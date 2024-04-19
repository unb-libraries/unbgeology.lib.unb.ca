export default defineEventHandler((event) => {
  const { pathname } = getRequestURL(event)
  if (/^\/api\/specimens/.test(pathname)) {
    setModel(event, Specimen.Base)
    const { slug } = getRouterParams(event)
    if (pathname.split(`/`).at(-1) === slug) {
      setEntityQueryOptions(event, { filter: false, sort: false })
    }
  }
})
