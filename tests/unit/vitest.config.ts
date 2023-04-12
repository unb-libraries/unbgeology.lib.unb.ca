import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: [
      `./tests/unit/specs/**/*.test.{js,ts}`,
    ],
  },
})
