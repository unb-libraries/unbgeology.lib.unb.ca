interface CreateYPIKOptions {
  year: number
}

export async function createYPIK(collection: string, options?: Partial<CreateYPIKOptions>): Promise<[number, number]> {
  const year = options?.year || new Date().getFullYear()
  const { yearCounter } = await SpecimenMeta.mongoose.model
    .findOneAndUpdate({ name: collection }, {
      $inc: {
        [`yearCounter.${year}`]: 1,
      },
    }, {
      upsert: true,
      returnDocument: `after`,
    })
    .select(`yearCounter.${year}`)
  return [year, yearCounter.get(`${year}`)!]
}
