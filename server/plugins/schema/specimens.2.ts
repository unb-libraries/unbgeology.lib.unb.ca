export default defineDocumentSchemaMigration(Specimen.Base, 2, async (S) => {
  const ypiks: Record<string, number> = {}

  const specimens = await S.find().sort({ created: `asc` })
  await Promise.all(specimens.map((doc, index) => {
    doc.ipik = index + 1
    if (doc.mimsyID) {
      doc.ypik = doc.mimsyID.split(`-`).slice(1).map(mid => mid.padStart(4, `0`)).join(`-`)
    } else {
      const year = new Date(doc.created).getFullYear()
      ypiks[year] ??= 1
      doc.ypik = `${year}-${`${ypiks[year]++}`.padStart(4, `0`)}`
    }
    doc.slug = `unb-${doc.ypik}`
    return doc.save()
  }))

  const currentYear = new Date().getFullYear()
  const jan1 = new Date(`${currentYear}`).valueOf()
  const counterCurrentYear = await Specimen.Base.mongoose.model
    .countDocuments({ created: { $gte: jan1 } })

  await SpecimenMeta.mongoose.model.updateMany({ name: `specimens` }, {
    [`yearCounter.${currentYear}`]: counterCurrentYear,
    counter: specimens.length,
  }, { upsert: true })
})
