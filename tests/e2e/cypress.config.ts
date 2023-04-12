import { defineConfig } from "cypress"

const e2eRoot = `./tests/e2e`
export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: `http://localhost:3118`,
    downloadsFolder: `${e2eRoot}/downloads`,
    fixturesFolder: `${e2eRoot}/fixtures`,
    screenshotsFolder: `${e2eRoot}/screenshots`,
    specPattern: `${e2eRoot}/specs/**/*.cy.ts`,
    supportFile: `${e2eRoot}/support/index.ts`,
    videosFolder: `${e2eRoot}/videos`,
  },
})
