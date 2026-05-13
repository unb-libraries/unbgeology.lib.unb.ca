import type { SitemapUrlInput } from "@nuxtjs/sitemap"
import { type EntityJSONList } from "~/layers/entity/src/types"
import { type Specimen } from "~/types/specimen"

export default defineSitemapEventHandler(async () => {
  let done = false
  const urls: SitemapUrlInput[] = []
  let page = 1

  while (!done) {
    const { entities, nav: { next } } = await $fetch<EntityJSONList<Specimen>>('/api/specimens', {
      query: {
        select: ['id', 'images', 'updated'],
        pageSize: 500,
        page: page++,
      }})
    urls.push(...(entities.map(({ id, images, updated }) => ({
      loc: `/specimens/${id}`,
      images: images.entities.map(({ uri }) => ({
        loc: uri,
      })),
      lastmod: updated,
    })) ?? []))

    if (!next) {
      done = true
    }
  }

  return urls
})
