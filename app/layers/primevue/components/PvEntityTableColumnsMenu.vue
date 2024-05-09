<template>
  <div class="form-field">
    <ul class="space-y-1">
      <li v-for="column in columns" :key="(column[0])" class="bg-primary-80/40 flex w-full flex-row rounded-sm px-3 py-1">
        <PvCheckbox
          :id="`column-${column[0]}`"
          v-model="column[2]"
          :label="column[1]"
          :name="`column-${column[0]}`"
          class="rounded-lg p-1"
          @change="selected => $emit(`change`, [column[0], column[1], selected])"
        />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  columns: [string, string, boolean][]
}>()

defineEmits<{
  change: [string, string, boolean][]
}>()
</script>
