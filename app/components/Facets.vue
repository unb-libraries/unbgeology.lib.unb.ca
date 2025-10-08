<template>
  <div v-show="facets?.entities.length"
    :class="[
      'group xl:w-1/5 xl:relative z-40 xl:z-auto', {
        'fixed bottom-0 xl:top-0 left-0 w-full h-[calc(100%-4rem)] bg-white dark:bg-black': !collapsed
      }]"
      @click.stop.self="$emit('toggled', true)"
  >
    <div :class="[
      'absolute scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent group-hover:scrollbar-thumb-base-57 dark:group-hover:scrollbar-thumb-base-27 gap-2 flex flex-col bottom-0 xl:sticky xl:top-[calc(15.5rem+2px)] h-full xl:max-h-[calc(100dvh-15.5rem-2px)] xl:overflow-y-scroll left-0 w-full p-8 xl:p-0 space-y-12 xl:space-y-0', {
        'hidden xl:flex': collapsed
      }]">
      <div class="xl:hidden flex flex-none justify-between">
        <h2 class="text-4xl">Filter</h2>
        <button @click.stop="$emit('toggled', true)">
          <IconCancel class="size-8 stroke-current stroke-2 hover:stroke-accent-36" />
        </button>
      </div>
      <div class="overflow-y-scroll">
        <Facet v-if="categoryFacet?.entities.length"
          :facet="categoryFacet"
          facetId="type"
          :options="categoryFacet?.entities ?? []"
          value-field="id"
          label-field="label"
          title="Categories"
          class="flex-none"
        />
        <Facet v-if="classificationFacet?.entities.length"
          :facet="classificationFacet"
          facetId="classification"
          :options="classificationOptions"
          value-field="id"
          label-field="label"
          title="Classifications"
          :collapsible="10"
          class="shrink"
        />
        <Facet v-if="ageFacet?.entities.length"
          :facet="ageFacet"
          facetId="age.relative"
          :options="ageOptions"
          value-field="id"
          label-field="label"
          title="Age"
          :collapsible="10"
          class="shrink"
        />
        <Facet v-if="numericFacet?.entities.length"
          :facet="numericFacet"
          facetId="age.numeric"
          :options="numericOptions"
          value-field="id"
          label-field="label"
          title="Numeric age"
          class="flex-none"
        />
        <Facet v-if="onDisplayFacet?.entities.length"
          :facet="onDisplayFacet"
          facetId="storage.location.public"
          :options="onDisplayOptions"
          value-field="id"
          label-field="label"
          title="On display"
          class="flex-none"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type EntityJSONList, type Entity } from '@unb-libraries/nuxt-layer-entity'
import { useRouteQuery } from '@vueuse/router'

defineProps<{
  collapsed?: boolean
}>()
const emit = defineEmits<{
  toggled: [status: boolean]
}>()

const mode = useRouteQuery<'list' | 'grid' | 'map'>('mode', 'list')
const search = useRouteQuery('search', '')
const filter = useRouteQuery('filter', [] as string | string[], {
  transform: (filter) => [...(Array.isArray(filter) ? filter : [filter]), mode.value === 'map' ? 'origin:1:1' : undefined].filter(Boolean)
})

type FacetEntity = { self: string, entities: { value: string, count: number }[] } & Entity
const { data: facets } = await useFetch<EntityJSONList<FacetEntity>>('/api/specimens/facets', {
  query: { search, filter }
})

const categoryFacet = computed(() => facets.value?.entities.find(({ self }) => self === '/api/specimens/facets/category'))

const classificationFacet = computed(() => facets.value?.entities.find(({ self }) => self === '/api/specimens/facets/classification'))
const classificationOptions = computed(() => (classificationFacet.value?.entities ?? [])
  .map(({ value, count }) => ({
    value: {
      id: value.self,
      label: value.label,
    },
    count,
  })))

const ageFacet = computed(() => facets.value?.entities.find(({ self }) => self === '/api/specimens/facets/age'))
const ageOptions = computed(() => (ageFacet.value?.entities ?? [])
  .map(({ value, count }) => ({
    value: {
      id: value.self,
      label: value.label,
    },
    count,
  })))

const numericFacet = computed(() => facets.value?.entities.find(({ self }) => self === '/api/specimens/facets/numericAge'))
const numericOptions = computed(() => (numericFacet.value?.entities ?? [])
  .map(({ value, count }) => ({
    value,
    label: value.map((b: number) => Math.floor(b / 1000000)),
    count
  }))
  .map(({ value, label, count }) => ({
    value: {
      id: value,
      label: label[0] === 0
        ? `< ${label[1]} Mya`
        : label.length < 2
          ? `> ${label[0]} Mya`
          : `${label[0]} - ${label[1]} Mya`
    },
    count,
  })))
const onDisplayFacet = computed(() => facets.value?.entities.find(({ self }) => self === '/api/specimens/facets/onDisplay'))
const onDisplayOptions = computed(() => (onDisplayFacet.value?.entities ?? [])
  .map(({ value, count }) => ({
    value: {
      id: value,
      label: Boolean(value) === true
        ? 'Yes'
        : 'No'
    },
    count,
  })))
</script>