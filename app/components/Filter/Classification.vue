<template>
  <Filter title="Classification" v-model:collapsed="collapsed" :toggler-class="togglerClass">
    <div class="group relative" tabindex="0">
      <input v-model="search" placeholder="Search" name="search-classifications" :class="['input w-full input-text-md placeholder:text-primary dark:placeholder:text-primary-20 placeholder:italic', { 'group-focus-within:rounded-b-none': options.length }]">
      <ul v-if="options.length" class="invisible group-focus-within:visible absolute bg-base dark:bg-primary w-full border-x border-b rounded-b-md border-primary-80 max-h-48 overflow-y-scroll">
        <li v-for="{ self, label } in options" :key="self" tabindex="0" class="px-3 py-1 hover:bg-accent-mid hover:text-white cursor-pointer" @keypress.enter.space="onSelect([self, label])" @click="onSelect([self, label])">
          {{ label }}
        </li>
      </ul>
    </div>
    <ul v-if="selection.length" class="flex flex-col w-full p-2 divide-y divide-primary-40 divide-dashed">
      <li v-for="[self, label] in selection" class="inline-flex items-center py-2 first:pt-0 last:pb-0">
        <span class="grow">{{ label }}</span>
        <button class="cursor-pointer rounded-md flex-none p-1 hover:bg-primary-40" @click="selection = selection.filter(([s]) => s !== self)"><IconCancel class="size-4 fill-none stroke-2 stroke-current" /></button>
      </li>
    </ul>
  </Filter>
</template>

<script lang="ts" setup>
import { type EntityJSONList, type EntityJSON, FilterOperator } from '@unb-libraries/nuxt-layer-entity'
import { type Classification } from '~/types/classification'

const selection = defineModel<[string, string][]>({ default: [] })
const collapsed = defineModel<boolean>('collapsed', { default: false })
const props = defineProps<{
  togglerClass?: string
}>()

const { query: q } = useRoute()
const initialSelection = (Array.isArray(q.filter) ? q.filter : [q.filter].filter(Boolean))
  .map(f => f!.split(':'))
  .filter(([field, op]) => field === 'classification' && Number(useEnum(FilterOperator).valueOf(op)) === FilterOperator.EQUALS)
  .map(([, , value]) => value)

if (initialSelection.length) {
  const { data: list } = await useFetch<EntityJSONList<Classification>>(`/api/terms/classifications`, {
    query: { filter: initialSelection.map(self => `self:equals:${self}`) }
  })
  selection.value = list?.value?.entities?.map(({ self, label }) => [self, label]) ?? []
}

const results = ref<EntityJSON<Classification>[]>([])
const options = computed(() => results.value.filter(({ self }) => !selection.value.some(([s]) => s === self)))
const search = ref('')

function onSelect(item: [string, string]) {
  const newSelection = [...selection.value, item]
  selection.value = newSelection
}

watch(search, async (search) => {
  if (search) {
    const { data: classifications } = await useFetch<EntityJSONList<Classification>>(`/api/terms/classifications`, {
      query: { filter: ['label:match:' + search] }
    })
    results.value = classifications.value?.entities ?? []
  } else {
    results.value = []
  }
})
</script>