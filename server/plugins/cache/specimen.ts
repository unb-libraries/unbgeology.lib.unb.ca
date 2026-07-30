export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook(`afterResponse`, async (event, response) => {
    if (event.path.match(/^\/api\/(specimens|terms|users)/) && [`PATCH`, `POST`, `PUT`, `DELETE`].includes(event.method)) {
      const cache = useStorage(`cache`)
      await cache.clear()
    }
  })
})
