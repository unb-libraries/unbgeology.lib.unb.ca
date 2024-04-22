export default defineEventHandler((event) => {
  const { pathname } = getRequestURL(event)
  if (pathname.match(/^\/api\/migrations/)) {
    setModel(event, Migration)
    const { id } = getRouterParams(event)
    if (pathname.split(`/`).at(-1) === id) {
      setEntityQueryOptions(event, { filter: false, sort: false })
    }
  }

  if (pathname.match(/^\/api\/migrations\/[0-9a-z]+\/items/)) {
    setModel(event, MigrationItem)
    const { sourceID } = getRouterParams(event)
    if (pathname.split(`/`).at(-1) === sourceID) {
      setEntityQueryOptions(event, { filter: false, sort: false })
    }
  }
})
