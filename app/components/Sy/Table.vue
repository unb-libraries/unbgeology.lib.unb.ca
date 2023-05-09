<template>
  <PvTable :value="rows">
    <PvColumn v-for="col of columns" :key="col.field" :header="col.header" :field="col.field" />
  </PvTable>
</template>

<script setup lang="ts">
const props = defineProps({
  header: {
    type: Object,
    required: true,
  },
  rows: {
    type: Array<Object>,
    default: [],
  },
})

const columns = computed(() => {
  return Object.entries(props.header).map(([column, label]: [string, string]) => ({
    header: label,
    field: column,
  }))
})
</script>
