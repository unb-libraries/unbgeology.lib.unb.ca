<template>
  <PvTable :value="entities" :row-class="() => `group hover:bg-accent-light`">
    <template #empty>
      <slot name="empty">
        No items found.
      </slot>
    </template>
    <PvTableColumn v-for="[column, header] in columns" :key="column" :field="column" :header="header">
      <template #body="slotProps">
        <slot :name="column" :value="slotProps.data[column]" :entity="slotProps.data">
          {{ slotProps.data[column] }}
        </slot>
      </template>
    </PvTableColumn>
  </PvTable>
</template>

<script setup lang="ts" generic="E extends Entity">
import { type Entity, type EntityJSON } from 'layers/base/types/entity'

const props = defineProps<{
  entities: EntityJSON<E>[]
  columns:(string | [string, string])[]
  label?: string | ((entity: E) => string)
}>()

const columns = computed(() => Object.values(props.columns).map(col => Array.isArray(col) ? col : [col, col.substring(0, 1).toUpperCase() + col.substring(1).toLowerCase()]))
</script>
