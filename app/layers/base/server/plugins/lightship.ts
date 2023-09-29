import { createLightship } from "lightship"
import type { NitroApp } from "nitropack"

export default defineNitroPlugin(async (nitroApp: NitroApp) => {
  const lightship = await createLightship({ detectKubernetes: false })
  lightship.signalReady()
})
