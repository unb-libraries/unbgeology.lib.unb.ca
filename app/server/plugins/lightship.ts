import type { NitroApp } from "nitropack"
import type { Lightship } from "lightship"

// Lightship is CommonJS module
// https://nodejs.org/api/esm.html#esm_interoperability_with_commonjs
import lightship from "lightship"
const { createLightship } = lightship

export default defineNitroPlugin(async (nitroApp: NitroApp) => {
  const lightship: Lightship = await createLightship();
  lightship.signalReady()
})