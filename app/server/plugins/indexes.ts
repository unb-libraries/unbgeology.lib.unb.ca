import { consola } from 'consola'

export default defineNitroPlugin(async (nitro) => {
  nitro.hooks.hook(`mongoose:init`, async ({ connection: { db } }) => {
    const definition = {
      mappings: {
        dynamic: true,
        fields: {
          slug: [
            { type: 'token' },
            { type: 'autocomplete' },
          ],
          type: [
            { type: 'string' },
          ],
          classification: [
            { type: 'objectId' },
          ],
          ageRelative: [
            { type: 'objectId' },
          ],
          origin: {
            type: 'document',
            fields: {
              latitude: {
                type: 'number',
              },
              longitude: {
                type: 'number',
              },
            },
          },
          name: [
            { type: 'string' },
            { type: 'token' },
            { type: 'autocomplete', tokenization: 'nGram' },
          ],
          description: [
            { type: 'string' },
            { type: 'autocomplete', tokenization: 'nGram' },
          ],
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
