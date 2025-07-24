<template>
  <div class="flex flex-col gap-y-12 w-full">
    <div class="flex flex-col gap-y-2 w-full items-center overflow-x-hidden">
      <div class="flex gap-x-2">
        <button v-for="cat in ['fossil', 'mineral', 'rock']"
          :key="cat"
          :data-state="category === cat ? 'active' : 'inactive'"
          class="bg-primary-40 px-4 py-2 border-none rounded-md data-[state=active]:bg-accent-mid hover:bg-accent-dark hover:data-[state=active]:bg-accent-dark"
          @click="selectCategory(cat)" 
        >
          {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}s
        </button>
      </div>
      <div class="flex gap-x-2 max-w-full">
        <div ref="selectorsDiv" class="grow flex gap-x-2 overflow-x-scroll snap-x">
          <button v-for="cls in classifications!.entities"
            :key="cls.self"
            type="button"
            ref="selectors"
            :data-state="classification.find(({ self }) => cls.self === self) ? 'active' : 'inactive'"
            class="bg-primary-60 px-4 py-2 border-none rounded-md snap-center flex-nowrap text-nowrap data-[state=active]:bg-accent-mid hover:bg-accent-dark hover:data-[state=active]:bg-accent-dark"
            @click="setClassification(cls)"
          >
            {{ cls.label }}
          </button>
        </div>
        <button type="button" v-show="next" class="flex-none bg-accent-mid border-none rounded-md p-2" @click.stop="selectorsDiv?.scrollBy({ left: 100, behavior: 'smooth' })">
          Next
        </button>
      </div>
    </div>
    <div v-if="classification.length" class="flex gap-x-12 w-full">
      <div class="bg-primary-20 dark:bg-primary-60 aspect-7/5 text-base dark:text-primary-40 justify-center items-center w-1/2 flex">
        <IconFossil v-if="category === 'fossil'" class="size-48 fill-none stroke-current stroke-1.5" />
        <IconMineral v-else-if="category === 'mineral'" class="size-48 fill-none stroke-current stroke-1.5" />
        <IconRock v-else class="size-48 fill-none stroke-current stroke-1.5" />
      </div>
      <div class="flex flex-col gap-y-4 w-1/2">
        <h2 class="text-4xl mb-4">{{ classification.at(-1)?.label }}</h2>
        <div class="grow">
          <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Doloribus, aliquid minus. Quia vero consequatur deserunt eius sed dolore quisquam repellendus magni. Aperiam cumque deleniti perferendis adipisci commodi, aut ipsum repellendus?</p>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi, eveniet neque! Doloremque, aliquam. Illum eligendi ea ipsam, nihil aut quis explicabo sequi ducimus eius. Minima est autem sunt! Consequuntur, autem.</p>
        </div>
        <div class="grid grid-cols-5 gap-x-2">
          <div v-for="i in 5" class="bg-primary-20 dark:bg-primary-60 aspect-square text-base dark:text-primary-40 justify-center items-center flex">
            <IconFossil v-if="category === 'fossil'" class="size-24 fill-none stroke-current stroke-1.5" />
            <IconMineral v-else-if="category === 'mineral'" class="size-24 fill-none stroke-current stroke-1.5" />
            <IconRock v-else class="size-24 fill-none stroke-current stroke-1.5" />
          </div>
        </div>
      </div>
    </div>
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