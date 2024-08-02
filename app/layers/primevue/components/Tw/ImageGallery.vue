<template>
  <div class="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10">
    <template v-for="image in images" :key="image.self">
      <slot>
        <div class="bg-primary thumbnail aspect-square w-full overflow-hidden rounded-md p-0">
          <img
            :src="`${image.uri}?w=${thumbnailSize ?? 150}&h=${thumbnailSize ?? 150}`"
            class="size-full object-cover"
            @click="$emit('click', image)"
          >
          <div class="absolute left-0 top-0 size-full empty:hidden">
            <slot name="overlay" :image="image" />
          </div>
        </div>
      </slot>
    </template>
  </div>
</template>

<script lang="ts" setup>
import type { Image } from '@unb-libraries/nuxt-layer-entity'

defineProps<{
  images: Image[]
  thumbnailClass?: string
  thumbnailSize?: number
}>()

defineEmits<{
  click: [id: Image]
}>()

</script>
