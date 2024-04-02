export default defineEventHandler((event) => {
  const { pathname } = getRequestURL(event)
  if (pathname.match(/^\/api\/files/)) {
    setModel(event, FileBase)
    const { id } = getRouterParams(event)
    if (pathname.split(`/`).at(-1) === id) {
      setEntityQueryOptions(event, { filter: false, sort: false })
    }
  }
})
