<template>
  <div ref="gallery" class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10">
    <template v-for="image in images" :key="image.self">
      <slot>
        <div :class="[`bg-primary thumbnail relative aspect-square w-full overflow-hidden rounded-md p-0`, thumbnailWrapperClass]">
          <img
            v-show="loaded[image.self]"
            :src="`${image.uri}?w=${thumbnailSize ?? 150}&h=${thumbnailSize ?? 150}`"
            :class="[`size-full object-cover`, thumbnailClass]"
            @load="loaded[image.self] = true"
            @click.prevent.stop="$emit('clickThumbnail', image)"
          >
          <div v-if="!loaded[image.self]" class="bg-primary-80/40 flex size-full items-center justify-center">
            <IconSpinner class="text-accent size-8 animate-spin fill-none stroke-current stroke-2" />
          </div>
          <div v-else class="absolute left-0 top-0 size-full empty:hidden" @click.prevent.stop="$emit(`clickThumbnail`, image)">
            <slot name="overlay" :image="image" />
          </div>
        </div>
      </slot>
    </template>
  </div>
</template>

<script lang="ts" setup>
import type { Image } from '@unb-libraries/nuxt-layer-entity'

const props = defineProps<{
  images: Image[]
  thumbnailClass?: string
  thumbnailWrapperClass?: string
  thumbnailSize?: number
}>()

defineEmits<{
  clickThumbnail: [image: Image]
}>()

const loaded = reactive<Record<string, boolean>>(Object.fromEntries(props.images.map(image => [image.self, false])))
</script>
