export default defineNitroPlugin(async (nitro) => {
  nitro.hooks.hook(`mongoose:init`, (mongoose) => {
    Term.mongoose.model.syncIndexes()
    FileBase.mongoose.model.syncIndexes()
    User.mongoose.model.syncIndexes()
    Specimen.Base.mongoose.model.syncIndexes()
  })
})
