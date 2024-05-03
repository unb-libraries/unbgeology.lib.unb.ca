import { consola } from "consola"
import { type Permission } from "@unb-libraries/nuxt-layer-entity"
import { createUserRole } from "../utils/casbin"

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook(`mongoose:init`, async () => {
    const roles: Record<string, Permission[]> = {
      sudo: [
        { action: [`create`], resource: `session` },
      ],
      sysadmin: [
        { action: [`read`, `create`, `update`, `delete`], resource: `user`, fields: [] },
      ],
      migrator: [
        { action: [`read`, `create`, `update`, `delete`], resource: `migration`, fields: [] },
        { action: [`read`, `create`, `update`, `delete`], resource: `migrationitem`, fields: [] },
        { action: [`create`, `delete`], resource: `term`, fields: [] },
        { action: [`create`, `delete`], resource: `specimen`, fields: [] },
      ],
      editor: [
        { action: [`read`, `create`, `update`, `delete`], resource: `term`, fields: [] },
        { action: [`read`, `create`, `update`, `delete`], resource: `file`, fields: [] },
        { action: [`read`], resource: `user`, fields: [`username`, `profile`] },
        { action: [`read`], resource: `migrationitem:imported`, fields: [] },
      ],
      public: [
        { action: `read`, resource: `term:published`, fields: [`label`] },
        { action: `read`, resource: `file:persisted`, fields: [`filename`, `uri`] },
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
