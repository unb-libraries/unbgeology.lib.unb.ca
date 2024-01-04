import { type File } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { type } = getRouterParams(event)
  const { select, sort, page, pageSize } = getQueryOptions(event)

  const files = await FileBase.find({ type })
    .select(getSelectedFields(select))
    .sort(sort.join(` `))
    .paginate(page, pageSize)
  return sendEntityList<File>(event, files)
})
