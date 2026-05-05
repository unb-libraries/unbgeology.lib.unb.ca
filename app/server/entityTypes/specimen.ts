// import type { H3Event } from "h3"
// import FileDrop from "~/layers/primevue/components/Tw/Input/FileDrop.vue"

// export interface Specimen {
//   id: string
//   title: string
//   pieces: number
// }

// export default defineEntityType<Specimen>()

// const defaultFields = [`id`, `title`, `pieces`]
// const filters = {
//   id: String,
//   title: String,
//   pieces: Number,
// }

// function getSpecimenQuery(event: H3Event) {
//   const { select } = getQuery<{ select?: string[] }>(event)
//   return {
//     select: select?.filter(field => defaultFields.includes(field)) || defaultFields,
//     filters: {
//       title: [`%`, `^Sample`],
//       pieces: [`>`, 1],
//     },
//   }
// }

// const { select, filters: { title, ...sfilters } } = getSpecimenQuery(event)
// const query = Specimen.mongoose.model.find()
// Object.entries({ name: title, ...sfilters }).forEach(([field, [op, value]]) => query.where({ [field]: { [opToMop(op)]: value } }))
// const docs = await query

// return docs
//   .map(doc => doc.toJSON())
//   .map(entity => Object.fromEntries(Object.entries(entity).filter(([key]) => select.includes(key))))
