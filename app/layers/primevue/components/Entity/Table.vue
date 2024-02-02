<template>
  <table>
    <thead :class="headerClass ?? ``">
      <tr class="dark:bg-accent-dark/10 dark:border-accent-dark border-b-2">
        <th v-for="[column, label] in columns" :key="column" class="p-4 text-left leading-6" :class="headerCellClass ?? ``">
          <slot :name="`${column}-header`">
            {{ label }}
          </slot>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(entity, index) in entities"
        :key="entity.id"
        :class="rowClass ?? ``"
        tabindex="0"
        @click.stop="emits(`select`, entity, index)"
      >
        <td v-for="[column] in columns" :key="`${entity.id}-${column}`" class="p-4 text-left leading-6" :class="cellClass ?? ``">
          <slot :name="column" :entity="entity">
            <template v-if="column in entity">
              {{ entity[column] }}
            </template>
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts" generic="E extends Entity">
import type { Entity, EntityJSON } from '@unb-libraries/nuxt-layer-entity'

const props = defineProps<{
  entities: EntityJSON<E>[]
  columns:(string | [string, string])[]
  headerClass?: string
  headerCellClass?: string
  rowClass?: string
  cellClass?: string
}>()

const emits = defineEmits<{
  select: [entity: EntityJSON<E>, index: number]
}>()

const columns = computed(() => Object.values(props.columns).map(col => Array.isArray(col) ? col : [col, col.substring(0, 1).toUpperCase() + col.substring(1).toLowerCase()]))
</script>
