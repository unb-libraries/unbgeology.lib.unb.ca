export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook(`mongoose:init`, (mongoose) => {
    // (async () => {
    //   await createSearchIndex(Specimen.Base, { "description": 1, "pk": 1, "objectIDs.id": 1, "objectIDs.type": 1, "origin.name": 1, "origin.description": 1 })
    //   await Specimen?.Base?.mongoose?.model?.ensureIndexes()
    // })();

    // (async () => {
    //   await createSearchIndex(Term, { label: 1 })
    //   await Term?.mongoose?.model?.ensureIndexes()
    // })();

    // (async () => {
    //   await createSearchIndex(User, { username: 1 })
    //   await User?.mongoose?.model?.ensureIndexes()
    // })()
  })
})
