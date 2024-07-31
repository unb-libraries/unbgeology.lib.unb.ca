export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook(`mongoose:init`, (connection) => {
    Object.values(connection.models)
      .map(Model => Model.collection.collectionName)
      .forEach(collection => nitro.hooks.callHook(`mongoose:schema:update`, collection))
  })
})
