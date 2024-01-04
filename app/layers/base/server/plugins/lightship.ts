import { createLightship } from "lightship"

export default defineNitroPlugin(async (nitroApp) => {
  const lightship = await createLightship({ detectKubernetes: false })
  lightship.signalReady()
})
