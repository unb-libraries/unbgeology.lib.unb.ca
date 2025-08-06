<template>
  <Filter :title="title" v-model:collapsed="collapsed">
    <div class="flex flex-col space-y-1.5">
      <div v-for="{ value, label, count } in options.slice(0, collapsible && optionsCollapsed ? collapsible : options.length)" class="w-full inline-flex items-start space-x-1.5">
        <input type="checkbox" :id="`filter-${title}[${value}]`.toLowerCase()" :name="`${title}[${value}]`.toLowerCase()" class="size-5 rounded-md input input-checkbox checked:text-base-17 checked:hover:text-accent-22 bg-white border border-base-17 hover:border-accent-22" :value="value" :checked="selection.includes(value)" @change="selection = selection.includes(value) ? selection.filter(v => v !== value) : [...selection, value]">
        <label :for="`filter-${title}[${value}]`.toLowerCase()" class="text-lg cursor-pointer overflow-hidden break-words leading-5 hover:text-accent-22">
          {{ label }} ({{ count }})
        </label>
      </div>
    </div>
    <button v-if="collapsible && options.length > collapsible" class="px-2 py-1 text-center w-full rounded-md border border-base-17 hover:border-accent-22 text-sm hover:text-accent-22 uppercase font-semibold" @click="optionsCollapsed = !optionsCollapsed">{{ optionsCollapsed ? 'Show all' : 'Show less' }}</button>
  </Filter>
</template>

<script lang="ts" setup>
const selection = defineModel<unknown[]>({ default: [] })
const collapsed = defineModel<boolean>('collapsed', { default: false })

const props = defineProps<{
  title: string
  options: {
    value: unknown
    count: number
  }[]
  valueField?: string
  labelField?: string
  collapsible?: number
}>()

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