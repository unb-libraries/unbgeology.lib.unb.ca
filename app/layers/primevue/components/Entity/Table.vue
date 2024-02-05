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
        v-for="(entity) in entities"
        :key="entity.id"
        :class="{ [rowClass ?? ``]: true, [selectedRowClass ?? ``]: props.multiSelect ? (selection as EntityJSON<E>[]).includes(entity) : (selection as EntityJSON<E>) === entity }"
        tabindex="0"
        @click.stop="onClickRow(entity)"
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

<script setup lang="ts" generic="E extends Entity, M extends boolean">
import type { Entity, EntityJSON } from '@unb-libraries/nuxt-layer-entity'

const props = defineProps<{
  entities: EntityJSON<E>[]
  columns:(string | [string, string])[]
  modelValue?: M extends false ? EntityJSON<E> | null : EntityJSON<E>[]
  multiSelect?: M extends true ? true : false
  headerClass?: string
  headerCellClass?: string
  rowClass?: string
  selectedRowClass? : string
  cellClass?: string
}>()

const emits = defineEmits<{
  select: [entity: EntityJSON<E>]
  // eslint-disable-next-line
    "update:modelValue": [M extends false ? EntityJSON<E> | null : EntityJSON<E>[]]
}>()

const columns = computed(() => Object.values(props.columns).map(col => Array.isArray(col) ? col : [col, col.substring(0, 1).toUpperCase() + col.substring(1).toLowerCase()]))
const selection = computed<M extends false ? EntityJSON<E> | null : EntityJSON<E>[]>({
  get() {
    return (props.modelValue ?? (props.multiSelect ? [] : null)) as M extends false ? EntityJSON<E> | null : EntityJSON<E>[]
  },
  set(value: M extends false ? EntityJSON<E> | null : EntityJSON<E>[]) {
    emits(`update:modelValue`, value)
  },
})

const onClickRow = (entity: EntityJSON<E>) => {
  if (!props.multiSelect) {
    (selection.value as EntityJSON<E> | null) = selection.value !== entity ? entity : null
  } else {
    const index = ((selection.value ?? []) as EntityJSON<E>[]).findIndex(e => e === entity)
    index >= 0 ? (selection.value as EntityJSON<E>[]).splice(index, 1) : (selection.value as EntityJSON<E>[]).push(entity)
  }
}
</script>
