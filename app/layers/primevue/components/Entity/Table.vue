<template>
  <table>
    <thead :class="headerClass ?? ``">
      <tr class="dark:bg-accent-dark/10 dark:border-accent-dark border-b-2">
        <th v-if="multiSelect && selection.length > 0" class="p-4 text-left leading-6">
          <PvCheckbox v-model="allChecked" />
        </th>
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
        :class="{ [rowClass ?? ``]: true, [selectedRowClass ?? ``]: selection.find(e => e === entity) }"
        tabindex="0"
        @click.stop="onClickRow(entity, index)"
      >
        <td v-if="multiSelect && selection.length > 0" class="w-16 p-4 text-left leading-6">
          <PvCheckbox v-model="checkboxes[index]" />
        </td>
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
import type { PvCheckbox } from '#build/components'

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

const selection = computed({
  get() {
    return (Array.isArray(props.modelValue ?? []) ? props.modelValue : [props.modelValue]) as EntityJSON<E>[]
  },
  set(value: EntityJSON<E>[]) {
    emits(`update:modelValue`, ((props.multiSelect ? value : value[0] ?? null) as M extends false ? EntityJSON<E> | null : EntityJSON<E>[]))
  },
})

const checkboxes = computed({
  get() {
    const selection = Array.from({ length: props.entities.length }).map(_ => false)
    if (props.multiSelect) {
      ((props.modelValue ?? []) as EntityJSON<E>[]).forEach((entity) => {
        const index = props.entities.findIndex(e => e === entity)
        if (index >= 0) {
          selection[index] = true
        }
      })
    } else {
      const index = props.entities.findIndex(e => e === props.modelValue)
      if (index >= 0) {
        selection[index] = true
      }
    }
    return selection
  },
  set(value: boolean[]) {
    selection.value = value.filter(v => v).map((_, i) => props.entities[i])
  },
})

const allChecked = computed({
  get() {
    return checkboxes.value.every(checked => checked)
  },
  set(value: boolean) {
    checkboxes.value = Array.from({ length: props.entities.length }).map(_ => value)
  },
})

const onClickRow = (entity: EntityJSON<E>, index: number) => {
  if (!props.multiSelect) {
    selection.value = selection.value[0] !== entity ? [entity] : []
  } else {
    const entityIndex = selection.value.findIndex(e => e === entity)
    if (entityIndex >= 0) {
      selection.value.splice(entityIndex, 1)
    } else {
      selection.value.push(entity)
    }
  }
}
</script>
