import { consola } from "consola"
import { type Permission } from "@unb-libraries/nuxt-layer-entity"
import { createUserRole } from "../utils/casbin"

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook(`mongoose:init`, async () => {
    const roles: Record<string, Permission[]> = {
      public: [
        { action: `read`, resource: `term:published`, fields: [`label`] },
        { action: `read`, resource: `file:persisted`, fields: [`filename`, `uri`] },
      ],
      editor: [
        { action: [`read`, `create`, `update`, `delete`], resource: `term`, fields: [] },
        { action: [`read`, `create`, `update`, `delete`], resource: `file`, fields: [] },
        { action: [`read`], resource: `user`, fields: [`username`, `profile`] },
      ],
      sysadmin: [
        { action: [`read`, `create`, `update`, `delete`], resource: `user`, fields: [] },
      ],
      sudo: [
        { action: [`create`], resource: `session` },
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
