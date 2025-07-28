<template>
  <div class="flex gap-x-6 w-full">
    <article v-for="category in ['fossil', 'mineral', 'rock']" class="flex flex-col gap-y-6 w-1/3">
      <SpecimenImage :category="(category as 'fossil' | 'mineral' | 'rock')" width="525" height="375" class="w-full aspect-7/5" />
      <h2 class="text-2xl">{{ category.charAt(0).toUpperCase() + category.slice(1) }}s</h2>
      <div>
        <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quod, sequi. Placeat facere enim culpa, corrupti accusantium dicta quae debitis ab, saepe qui a nihil quod dolores ratione. Doloremque, reiciendis rem?</p>
        <a :href="`/browse/${category}`" class="text-accent-mid text-lg font-semibold hover:underline border-none rounded-md">Browse {{ category.charAt(0).toUpperCase() + category.slice(1) }}s</a>
      </div>
    </article>
  </div>
</template>

<script lang="ts" setup>
import type { EntityJSONList } from '@unb-libraries/nuxt-layer-entity'
import type { Classification } from '~/types/classification'

definePageMeta({
  layout: 'page',
  name: 'Browse',
})

const category = ref('fossil')
const classification = ref<Pick<Classification, 'self' | 'label'>[]>([])

const selectorsDiv = ref<HTMLDivElement>()
const selectors = ref<HTMLButtonElement[]>([])
const next = computed(() => selectorsDiv.value && selectors.value
  .sort((a, b) => a.getBoundingClientRect().right - b.getBoundingClientRect().right)
  .find(s => s.getBoundingClientRect().right > selectorsDiv.value!.getBoundingClientRect().right))

const filter = computed(() => ['depth:equals:0', `type:equals:classification/${category.value}`])
const { data: classifications, refresh } = await useFetch<EntityJSONList<Classification>>('/api/terms/classifications', { query: { filter } })

async function selectCategory(type: string) {
  category.value = type
  classification.value = []
  await refresh()
  nextTick(() => {
    const newClassification = classifications.value?.entities[0]
    if (newClassification) {
      setClassification({ self: newClassification.self, label: newClassification.label })
    }
  })
}

function setClassification(self: Pick<Classification, 'self' | 'label'>) {
  classification.value = [...classification.value.slice(0, -1), self]
}
</script>