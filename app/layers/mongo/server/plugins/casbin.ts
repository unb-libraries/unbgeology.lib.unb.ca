import { consola } from "consola"
import { type Permission } from "@unb-libraries/nuxt-layer-entity"
import { createUserRole } from "../utils/casbin"

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook(`mongoose:init`, async () => {
    const roles: Record<string, Permission[]> = {
      visitor: [{ action: `read`, resource: `person`, fields: [`id`, `label`] }],
      editor: [
        { action: [`read`, `create`, `delete`], resource: `person`, fields: [] },
        { action: [`update`], resource: `person`, fields: [`firstName`, `lastName`] },
      ],
    }

    await Promise.all(Object.entries(roles).map(async ([roleID, permissions]) => {
      const [base, role] = roleID.indexOf(`.`) > 0 ? roleID.split(`.`) : [null, roleID]
      const success = await createUserRole(role, permissions, base ? { base } : {}) || await updateUserRole(role, permissions)
      if (!success) {
        consola.error(`Failed to create role`)
      }
      return success
    }))
  })
})
