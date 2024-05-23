<template>
  <div>
    <a id="button-columns" class="button button-md hover:button-primary-80" @click.prevent="visible = !visible">
      Columns
    </a>
    <PvContextualDropdown
      v-model="visible"
      trigger-id="button-columns"
      class="context-menu"
    >
      <PvEntityTableColumnsMenu :columns="columns" @change="(column, selected, columns) => $emit(`toggled`, column, selected, columns)" />
    </PvContextualDropdown>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  columns: [string, string, boolean][]
}>()

defineEmits<{
  toggled: [column: string, selected: boolean, columns: [string, string, boolean][]]
}>()

const visible = ref(false)
</script>
