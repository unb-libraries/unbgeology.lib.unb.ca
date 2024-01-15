export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook(`migrate:import:item`, async (data, migration, { ready, require, error }) => {
    if (migration.entityType === `StorageLocation`) {
      const { parent: parentID, ...body } = data
      if (parentID !== 0) {
        try {
          const parentURI = await useMigrationLookup(migration, parentID)
          if (parentURI) {
            body.parent = parentURI
            ready(body)
          } else {
            require(parentID, migration)
          }
        } catch (err: any) {
          error(`Item depends on ${parentID}, but the item does not exist.`)
        }
      } else {
        ready(body)
      }
    }
  })
})
