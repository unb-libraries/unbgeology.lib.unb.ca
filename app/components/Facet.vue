<template>
  <Filter :title="title" v-model:collapsed="collapsed" toggler-class="hidden xl:block">
    <div v-for="{ value, count } in options" class="inline-flex items-center space-x-1">
      <input type="checkbox" :id="`filter-${title.toLowerCase()}[${value}]`" :name="`${title.toLowerCase()}[${value}]`" class="size-5 rounded-md input input-checkbox" :value="value" :checked="selection.includes(value)" @change="selection = selection.includes(value) ? selection.filter(v => v !== value) : [...selection, value]">
      <label :for="`filter-${title.toLowerCase()}[${value}]`" class="text-lg mr-4 cursor-pointer">
        {{ value }} ({{ count }})
      </label>
    </div>
  </Filter>
</template>

<script lang="ts" setup>
const selection = defineModel<unknown[]>({ default: [] })
const collapsed = defineModel<boolean>('collapsed', { default: false })

defineProps<{
  title: string
  options: {
    value: unknown
    count: number
  }[]
}>()
</script>