export default defineEventHandler((event) => {
  const { path } = event

  return Object
    .keys(TermBase.discriminators || {})
    .map(vocabulary => vocabulary.split(`.`).at(-1))
    .map(vocabulary => ({
      name: vocabulary,
      self: `${path}/${vocabulary!.toLowerCase()}`,
    }))
})
