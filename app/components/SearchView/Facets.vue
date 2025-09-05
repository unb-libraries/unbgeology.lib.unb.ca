<template>
  <div v-show="facets?.entities.length"
    :class="[
      'group xl:w-1/5 xl:relative z-40 xl:z-auto', {
        'fixed top-0 left-0 size-full bg-primary-80/80': !collapsed
      }]"
      @click.stop.self="$emit('toggled', true)"
    >
    <div :class="[
      'absolute scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent group-hover:scrollbar-thumb-base-57 dark:group-hover:scrollbar-thumb-base-27 gap-2 xl:flex xl:flex-col bottom-0 xl:sticky xl:top-[calc(15.5rem+2px)] max-h-4/5 xl:max-h-[calc(100dvh-15.5rem-2px)] overflow-y-scroll left-0 w-full', {
        hidden: collapsed
      }]">
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
        :options="classificationFacet?.entities ?? []"
        value-field="id"
        label-field="label"
        title="Classifications"
        :collapsible="10"
        class="shrink"
      />
      <Facet v-if="ageFacet?.entities.length"
        :facet="ageFacet"
        facetId="age.relative"
        :options="ageFacet?.entities ?? []"
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

const search = useRouteQuery('search', '')
const filter = useRouteQuery('filter', [] as string | string[], {
  transform: (filter) => Array.isArray(filter) ? filter : [filter].filter(Boolean)
})

type FacetEntity = { self: string, entities: { value: string, count: number }[] } & Entity
const { data: facets } = useFetch<EntityJSONList<FacetEntity>>('/api/specimens/facets', {
  query: { search, filter }
})

const categoryFacet = computed(() => facets.value?.entities.find(({ self }) => self === '/api/specimens/facets/category'))
const classificationFacet = computed(() => facets.value?.entities.find(({ self }) => self === '/api/specimens/facets/classification'))
const ageFacet = computed(() => facets.value?.entities.find(({ self }) => self === '/api/specimens/facets/age'))
const numericFacet = computed(() => facets.value?.entities.find(({ self }) => self === '/api/specimens/facets/numericAge'))
const numericOptions = (numericFacet.value?.entities ?? [])
  .map(({ value, count }) => ({
    value: value[0],
    label: value.map((b: number) => Math.floor(b / 1000000)),
    count
  }))
  .map(({ value, label, count }) => ({
    value: {
      value, label: label[0] === 0
        ? `< ${label[1]} Mya`
        : label.length < 2
          ? `> ${label[0]} Mya`
          : `${label[0]} - ${label[1]} Mya`
    },
    count,
  }))
const onDisplayFacet = computed(() => facets.value?.entities.find(({ self }) => self === '/api/specimens/facets/onDisplay'))
const onDisplayOptions = computed(() => (onDisplayFacet.value?.entities ?? [])
  .map(({ value, count }) => ({
    value: {
      value, label: Boolean(value) === true
        ? 'Yes'
        : 'No'
    },
    count,
  })))
</script>