<template>
  <div class="form-field">
    <ul class="space-y-1">
      <li v-for="column in columns" :key="(column[0])" class="bg-primary-80/60 flex w-full flex-row rounded-sm px-3 py-1">
        <PvCheckbox
          :id="`column-${column[0]}`"
          v-model="column[2]"
          :label="column[1]"
          :name="`column-${column[0]}`"
          class="rounded-lg p-1"
          @change="selected => onChange(column[0], selected)"
        />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  columns: [string, string, boolean][]
}>()

const emits = defineEmits<{
  change: [id: string, selected: boolean, items: [string, string, boolean][]]
}>()

const onChange = (id: string, selected: boolean) => {
  const columns = props.columns.map<[string, string, boolean]>(([columnId, label, isSelected]) => columnId === id ? [columnId, label, selected] : [columnId, label, isSelected])
  emits(`change`, id, selected, columns)
}
</script>
