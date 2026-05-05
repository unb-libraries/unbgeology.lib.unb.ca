export default defineEventHandler((event) => {
  const { pathname } = getRequestURL(event)
  if (pathname.match(/^\/api\/users/)) {
    setModel(event, User)
    const { username } = getRouterParams(event)
    if (pathname.split(`/`).at(-1) === username) {
      setEntityQueryOptions(event, { filter: false, sort: false })
    }
  }
})
