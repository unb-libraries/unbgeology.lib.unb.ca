import { type User } from "~/server/entityTypes/User"

export default defineEventHandler(async (event) => {
  const { select, sort, page, pageSize } = getQueryOptions(event)

  const selectedFields = getSelectedFields(select)
  if (selectedFields.length) {
    selectedFields.push(`username`)
  }
  const users = await User.find()
    .select(selectedFields)
    .sort(sort.join(` `))
    .paginate(page, pageSize)

  return sendEntityList<User>(event, users)
})
