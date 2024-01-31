export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook(`mongoose:init`, (mongoose) => {
    (async () => {
      await createSearchIndex(Specimen, { description: 1 })
      await Specimen.ensureIndexes()
    })();

    (async () => {
      await createSearchIndex(TermBase, { label: 1 })
      await TermBase.ensureIndexes()
    })()
  })
})
