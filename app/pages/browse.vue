<template>
  <div class="flex flex-col space-y-8 h-full">
    <ul class="flex space-x-4 flex-none w-full justify-center">
      <li :class="['cursor-pointer rounded-md px-4 py-2', { 'bg-primary-40 text-base dark:bg-primary-40 dark:text-primary': selection === 'fossil', 'bg-transparent dark:hover:bg-primary-40 dark:hover:text-primary dark:text-base': selection !== 'fossil' }]" @click="onSelect('fossil')">Fossils</li>
      <li :class="['cursor-pointer rounded-md px-4 py-2', { 'bg-primary-40 text-base dark:bg-primary-40 dark:text-primary': selection === 'mineral', 'bg-transparent dark:hover:bg-primary-40 dark:hover:text-primary dark:text-base': selection !== 'mineral' }]" @click="onSelect('mineral')">Minerals</li>
      <li :class="['cursor-pointer rounded-md px-4 py-2', { 'bg-primary-40 text-base dark:bg-primary-40 dark:text-primary': selection === 'rock', 'bg-transparent dark:hover:bg-primary-40 dark:hover:text-primary dark:text-base': selection !== 'rock' }]" @click="onSelect('rock')">Rocks</li>
    </ul>
    <ul class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-2 overflow-y-scroll">
      <li v-for="classification in list?.entities" class="p-1 cursor-pointer hover:border-accent-dark hover:text-accent-dark dark:hover:border-accent-mid dark:hover:text-accent-mid aspect-square flex justify-center items-center bg-primary-20 dark:bg-primary-80 border border-primary-40 dark:border-primary-60">
        <a href="/specimens" class="flex flex-col gap-y-2 size-full items-center justify-center">
          <img v-if="classification.image" :src="`${classification.image.uri}?w=320&h=320`" :title="classification.label" class="size-full object-cover" />
          {{ classification.label }}
        </a>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import type { EntityJSONList } from '@unb-libraries/nuxt-layer-entity'
import type { Classification } from '~/types/classification'

definePageMeta({
  layout: 'page',
  name: 'Browse',
})

const selection = ref('fossil')
const filter = computed(() => ['depth:equals:0', `type:equals:classification/${selection.value}`])
const { data: list, refresh } = await useFetch<EntityJSONList<Classification>>('/api/terms/classifications', { query: { filter } })

async function onSelect(type: string) {
  selection.value = type
  await refresh()
}
</script>