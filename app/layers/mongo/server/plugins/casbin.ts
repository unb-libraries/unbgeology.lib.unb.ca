import { type Permission } from "@unb-libraries/nuxt-layer-entity"
import { createUserRole } from "../utils/casbin"

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook(`mongoose:init`, async () => {
    const roles: Record<string, Permission[]> = {
      visitor: [{ action: `read`, resource: `term<person>`, fields: [] }],
      editor: [{ action: [`read`, `create`, `update`, `delete`], resource: `term<person>`, fields: [] }],
    }

    await Promise.all(Object.entries(roles).map(([role, permissions]) => createUserRole(role, permissions)))
  })
})
