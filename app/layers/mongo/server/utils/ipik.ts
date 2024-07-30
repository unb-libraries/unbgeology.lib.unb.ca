export async function createIPIK(collection: string) {
  const meta = await Meta.mongoose.model
    .findOneAndUpdate({ name: collection }, { $inc: { counter: 1 } }, { upsert: true, returnDocument: `after` })
    .select(`counter`)
  return meta.counter
}
