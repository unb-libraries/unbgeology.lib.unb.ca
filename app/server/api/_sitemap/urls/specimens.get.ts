import type { SitemapUrlInput } from "@nuxtjs/sitemap"

export default defineSitemapEventHandler(async () => {
  return [] satisfies SitemapUrlInput[]
})
