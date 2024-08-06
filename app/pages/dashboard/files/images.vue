<template>
  <div class="flex h-full flex-col space-y-8">
    <div class="flex h-full grow flex-col space-y-4">
      <TwImageGallery :images="images" class="h-full grow overflow-y-scroll" thumbnail-class="hover:cursor-pointer hover:opacity-80" @click-thumbnail="onClickImage" />
      <div class="flex h-fit flex-row justify-between">
        <div v-if="list?.total" class="italic">
          Displaying {{ (page - 1) * pageSize + 1 }} - {{ Math.min(list?.total, page * pageSize) }} of {{ pluralize(list.total, `image`, `images`) }}
        </div>
        <div v-else>
          No specimens found
        </div>
        <TwPageIndex :page="page" :size="5" :total="pages" @change="newPage => page = newPage" />
      </div>
    </div>
    <TwFileUpload @upload="refresh" />
  </div>
</template>

<script setup lang="tsx">
import { FilterOperator, type Image } from "@unb-libraries/nuxt-layer-entity"
import { TwLightbox } from "#components"

definePageMeta({
  layout: `dashboard-page`,
  name: `Images`,
})

const { list, entities: images, query: { page, pageSize }, refresh } = await fetchEntityList<Image>(`File`, {
  filter: [[`type`, FilterOperator.EQUALS, `image`]],
  sort: [`-created`],
  pageSize: 50,
})
const pages = computed(() => Math.ceil((list.value?.total ?? 0) / pageSize.value))

const { stackContent, unstackContent } = useModal()
function onClickImage(image: Image) {
  stackContent(<TwLightbox src={image.uri} onCancel={unstackContent}></TwLightbox>)
}

</script>
