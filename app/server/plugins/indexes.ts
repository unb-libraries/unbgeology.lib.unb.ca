import { consola } from 'consola'

export default defineNitroPlugin(async (nitro) => {
  nitro.hooks.hook(`mongoose:init`, async ({ connection: { db } }) => {
    const definition = {
      mappings: {
        dynamic: true,
        fields: {
          name: {
            type: 'autocomplete',
          },
          description: {
            type: 'autocomplete',
          }
        }
      }
    }
    
    try {
      const { ok } = await db.command({
        updateSearchIndex: `specimens`,
        name: `autocomplete`,
        definition,
      })
      if (ok) {
        consola.success(`Updated index "autocomplete"`)
      }
    } catch (e) {
      const { ok } = await db.command({
        createSearchIndexes: `specimens`,
        indexes: [{
          name: 'autocomplete',
          type: 'search',
          definition,
        }]
      })
      if (ok) {
        consola.success(`Created index "autocomplete"`)
      }
    }
  })
})
