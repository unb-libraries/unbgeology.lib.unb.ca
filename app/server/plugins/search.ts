export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook(`mongoose:init`, (mongoose) => {
    (async () => {
      await createSearchIndex(Specimen.Base.mongoose.model, { description: 1 })
      await Specimen.Base.mongoose.model.ensureIndexes()
    })();

    (async () => {
      await createSearchIndex(Term.mongoose.model, { label: 1 })
      await Term.mongoose.model.ensureIndexes()
    })();

    (async () => {
      await createSearchIndex(User.mongoose.model, { username: 1 })
      await User.mongoose.model.ensureIndexes()
    })()
  })
})
