<template>
  <Filter :title="title" v-model:collapsed="collapsed">
    <div v-for="{ value, label, count } in options" class="inline-flex items-center space-x-1">
      <input type="checkbox" :id="`filter-${title}[${value}]`.toLowerCase()" :name="`${title}[${value}]`.toLowerCase()" class="size-5 rounded-md input input-checkbox" :value="value" :checked="selection.includes(value)" @change="selection = selection.includes(value) ? selection.filter(v => v !== value) : [...selection, value]">
      <label :for="`filter-${title}[${value}]`.toLowerCase()" class="text-lg mr-4 cursor-pointer">
        {{ label }} ({{ count }})
      </label>
    </div>
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
}>()

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