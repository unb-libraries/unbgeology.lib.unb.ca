import Classification, { type Classification as IClassification } from "~/server/entityTypes/Classification"

export default defineEventHandler(async (event) => {
  const { slug } = event.context.params!
  const deleteOrphans = [`1`, `true`, ``].includes(getQuery(event).deleteOrphans as string)

  try {
    const classification: IClassification | undefined = await Classification.findOne({ slug })
    if (!classification) {
      throw createError({ statusCode: 404, statusMessage: `Classification object "${slug}" not found.` })
    }

    if (deleteOrphans) {
      await Classification.deleteMany({
        $or: [
          { _id: classification._id },
          { subClassOf: { $in: classification._id } }],
      })
    } else {
      // await Classification.updateMany({ subClassOf: classification._id }, { $pull: { subClassOf: classification._id } })
      await Classification.updateOne({ super: classification._id }, { super: classification.super })
      await Classification.deleteOne({ _id: classification._id })
    }

    return null
  } catch (err: any) {
    console.log(err)
  }
})
