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
        { action: [`create`], resource: `session` },
        { action: [`read`, `create`, `update`, `delete`], resource: `user`, fields: [] },
        { action: [`read`, `create`, `update`, `delete`], resource: `file`, fields: [] },
        { action: [`read`, `create`, `update`, `delete`], resource: `migration`, fields: [] },
        { action: [`read`, `create`, `update`, `delete`], resource: `migrationitem`, fields: [] },
        { action: [`read`, `create`, `update`, `delete`], resource: `term`, fields: [] },
        { action: [`read`, `create`, `update`, `delete`], resource: `specimen`, fields: [] },
      ],
      migrator: [
        { action: [`read`, `create`, `update`, `delete`], resource: `migration`, fields: [] },
        { action: [`read`, `create`, `update`, `delete`], resource: `migrationitem`, fields: [] },
        { action: [`create`, `delete`], resource: `term:`, fields: [] },
        { action: [`create`, `delete`], resource: `specimen:migrated`, fields: [] },
      ],
      curator: [
        { action: [`read`, `create`, `update`, `delete`], resource: `specimen`, fields: [] },
      ],
      editor: [
        { action: [`read`, `create`, `update`, `delete`], resource: `specimen:draft`, fields: [] },
        { action: [`read`, `update`], resource: `specimen:migrated`, fields: [] },
        { action: [`read`], resource: `specimen:published`, fields: [] },
        { action: [`read`, `update`], resource: `specimen:migrated`, fields: [] },
        { action: [`read`, `create`, `update`, `delete`], resource: `term`, fields: [] },
        { action: [`read`, `create`, `update`, `delete`], resource: `file`, fields: [] },
        { action: [`read`], resource: `user`, fields: [`id`, `profile`] },
        { action: [`read`], resource: `migrationitem:imported`, fields: [] },
      ],
      public: [
        {
          action: `read`,
          resource: `specimen:published`,
          fields: [
            `type`,
            `objectIDs`,
            `slug`,
            `description`,
            `images`,
            `classification`,
            `measurements`,
            `date`,
            `age`,
            `origin`,
            `pieces`,
            `partial`,
            `collector`,
            `sponsor`,
            `publications`,
          ],
        },
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
