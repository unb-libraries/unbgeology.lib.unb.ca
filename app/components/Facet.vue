<template>
  <Filter :title="title" v-model:collapsed="collapsed">
    <div class="flex flex-col space-y-1.5">
      <div v-for="{ value, label, count } in options.slice(0, collapsible && optionsCollapsed ? collapsible : options.length)" class="w-full inline-flex items-start space-x-1.5">
        <input
          type="checkbox"
          :id="`filter-${title}[${value}]`.toLowerCase()"
          :name="`${title}[${value}]`.toLowerCase()"
          class="peer size-5 rounded-md input input-checkbox checked:hover:text-accent-26 dark:checked:hover:text-accent-36 bg-white checked:bg-base-17 dark:bg-base-2 dark:checked:bg-accent-36 border border-base-17  dark:border-base-37 hover:border-accent-26 dark:hover:border-accent-36"
          :value="String(value)"
          :checked="selection.includes(String(value))"
          @change="selection = selection.includes(String(value)) ? selection.filter(v => v !== String(value)) : [...selection, String(value)]"
        >
        <label :for="`filter-${title}[${value}]`.toLowerCase()" class="text-lg cursor-pointer overflow-hidden break-words leading-5 hover:text-accent-26 dark:hover:text-accent-36 peer-hover:text-accent-26 dark:peer-hover:text-accent-36">
          {{ label }} ({{ count }})
        </label>
      </div>
    </div>
    <button v-if="collapsible && options.length > collapsible" class="px-2 py-1 text-center w-full rounded-md border border-base-17 dark:border-base-37 hover:border-accent-26 dark:hover:border-accent-36 text-sm hover:text-accent-26 dark:hover:text-accent-36 uppercase font-semibold" @click="optionsCollapsed = !optionsCollapsed">{{ optionsCollapsed ? 'Show all' : 'Show less' }}</button>
  </Filter>
</template>

<script lang="ts" setup>
import { FilterOperator } from '@unb-libraries/nuxt-layer-entity';

const collapsed = defineModel<boolean>('collapsed', { default: false })
const props = defineProps<{
  facet: {
    self: string,
    entities: { value: unknown, label: string, count: number }[]
  }
  facetId: string,
  title: string
  options: {
    value: unknown
    count: number
  }[]
  valueField?: string
  labelField?: string
  collapsible?: number
}>()

const filter = useRouteQuery('filter', [] as string | string[], {
  transform: (filter) => Array.isArray(filter) ? filter : [filter].filter(Boolean)
})
const selection = computed({
  get() {
    const newFilter = filter.value
      .map(filter => filter.split(':') as [string, FilterOperator, string])
      .filter(([field]) => field === props.facetId)
      .map(([, , value]) => String(value)) ?? []
    return newFilter
  },
  set(selection: string[]) {
    filter.value = [
      ...filter.value
        .map(filter => filter.split(':') as [string, FilterOperator, string])
        .filter(([field]) => field !== props.facetId)
        .map(filter => filter.join(':')),
      ...selection
        .map(value => [props.facetId, FilterOperator.EQUALS, value].join(':'))
    ]
  }
})

const optionsCollapsed = ref(props.collapsible ? true : false)
const options = computed(() => props.options.map(({ value, count }) => ({
  value: getValue(value),
  label: getLabel(value),
  count,
})))

function getValue(value: unknown) {
  return props.valueField && typeof value === `object` && value
    ? value[props.valueField as keyof typeof value] ?? value
    : value
}

function getLabel(value: unknown) {
  return props.labelField && typeof value === `object` && value
    ? value[props.labelField as keyof typeof value] ?? value
    : value
}
</script>