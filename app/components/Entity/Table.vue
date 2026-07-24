<template>
  <table>
    <thead :class="headerClass ?? ``">
      <tr class="bg-accent-dark/10 border-accent-dark border-b-2">
        <th v-if="multiSelect && selection.length > 0" class="p-4 text-left leading-6">
          <PvCheckbox
            :model-value="selection.length === entities.length"
            label=""
            @update:model-value="selection = $event ? entities : []"
          />
        </th>
        <th v-for="[column, label] in columns" :key="column" class="p-4 text-left leading-6" :class="headerCellClass ?? ``">
          <slot :name="`${column}-header`">
            {{ label }}
          </slot>
        </th>
      </tr>
    </thead>
    <tbody class="relative">
      <tr
        v-for="entity in entities"
        :key="entity.id"
        :class="{ [rowClass ?? ``]: true, [selectedRowClass ?? ``]: selection?.find(e => e === entity) }"
        tabindex="0"
        @click.stop="toggle(entity)"
      >
        <td v-if="multiSelect && selection.length > 0" class="w-16 p-4 text-left leading-6">
          <PvCheckbox
            :model-value="selection.includes(entity)"
            label=""
            @update:model-value="toggle(entity)"
          />
        </td>
        <td v-for="[column] in columns" :key="`${entity.id}-${column}`" class="p-4 text-left leading-6" :class="cellClass ?? ``">
          <slot :name="column" :entity="entity">
            <template v-if="column! in entity">
              {{ entity[column as keyof EntityJSON<E>] }}
            </template>
          </slot>
        </td>
      </tr>
      <div v-if="loading" :class="[`absolute left-0 top-0 flex size-full justify-center p-16`, loadingOverlayClass]">
        <slot name="loading">
          <IconSpinner class="text-accent size-12 animate-spin fill-none stroke-current stroke-2" />
        </slot>
      </div>
    </tbody>
  </table>
</template>

<script setup lang="ts" generic="E extends Entity, M extends boolean">
import type { Entity, EntityJSON } from '@unb-libraries/nuxt-layer-entity'

type S = M extends false ? EntityJSON<E> : EntityJSON<E>[]

const value = defineModel<S>()
const props = defineProps<{
  entities: EntityJSON<E>[]
  columns: (string | [string, string])[]
  multiSelect?: M extends true ? true : false
  headerClass?: string
  headerCellClass?: string
  rowClass?: string
  selectedRowClass?: string
  cellClass?: string
  loading?: boolean
  loadingOverlayClass?: string
}>()

const emits = defineEmits<{
  select: [entity: EntityJSON<E>]
}>()

const columns = computed(() => Object.values(props.columns).map(col => Array.isArray(col) ? col : [col, col.substring(0, 1).toUpperCase() + col.substring(1).toLowerCase()]))
const selection = computed({
  get() {
    return value.value
      ? (Array.isArray(value.value)
        ? value.value
        : [value.value]) as EntityJSON<E>[]
      : []
  },
  set(v: EntityJSON<E>[]) {
    value.value = ((props.multiSelect ? v : v?.[0]) as S)
  },
})

const toggle = (entity: EntityJSON<E>) => {
  if (!selection.value.map(e => e.self).includes(entity.self)) {
    selection.value = [...selection.value ?? [], entity]
  } else {
    selection.value = selection.value.filter(e => e.self !== entity.self)
  }
}
</script>
