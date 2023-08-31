export default defineEventHandler((event) => {
  const { path } = event
  return {
    "self": path,
    "storage-units": {
      self: `${path}/storage-units`,
    },
  }
})
