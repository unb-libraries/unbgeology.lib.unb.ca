import { consola } from "consola"
import { type Permission } from "@unb-libraries/nuxt-layer-entity"
import { createUserRole } from "../utils/casbin"

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook(`mongoose:init`, async () => {
    const roles: Record<string, Permission[]> = {
      visitor: [{ action: `read`, resource: `person`, fields: [] }],
      editor: [{ action: [`read`, `create`, `update`, `delete`], resource: `person`, fields: [] }],
    }

    const results = await Promise.all(Object.entries(roles).map(([role, permissions]) => createUserRole(role, permissions)))
    results.forEach((success) => {
      if (!success) {
        consola.error(`Failed to create role`)
      }
    })
  })
})
