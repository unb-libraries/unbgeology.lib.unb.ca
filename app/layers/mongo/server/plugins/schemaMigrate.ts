export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook(`mongoose:init`, (connection) => {
    Object.values(connection.models)
      .forEach(Model => nitro.hooks.callHook(`mongoose:schema:update`, Model))
  })
})
