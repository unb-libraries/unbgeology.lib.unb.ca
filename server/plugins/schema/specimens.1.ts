export default defineDocumentSchemaMigration(Specimen.Base, 1, async (Specimen) => {
  // Set ageRelative field
  await Specimen.updateMany([{ $set: { relativeAge: [`$age.unit`] } }])
    .where(`age.unit`).exists(true)

  // Set ageNumeric field
  await Specimen.updateMany([{ $set: { numericAge: [`$age.numeric`] } }])
    .where(`age.numeric`).exists(true)
})
