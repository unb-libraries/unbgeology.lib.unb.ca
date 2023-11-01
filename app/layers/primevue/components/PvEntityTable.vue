<template>
  <PvTable :value="list?.entities" :row-class="() => `group hover:bg-accent-light`">
    <template #empty>
      <slot name="empty">
        No items found.
      </slot>
    </template>
    <PvTableColumn v-for="[column, header] in columns" :key="column" :field="column" :header="header">
      <template #body="slotProps">
        <slot v-if="column in slotProps.data && slotProps.data[column] !== undefined" :name="column" :value="slotProps.data[column]" :entity="slotProps.data">
          {{ slotProps.data[column] }}
        </slot>
      </template>
    </PvTableColumn>
    <PvTableColumn field="self">
      <template #body="{ data }">
        <div class="invisible flex flex-row justify-end group-hover:visible">
          <a :href="`/dashboard/${data.self.substring(5)}`" :title="`Edit ${label(data) ?? `item`}`" class="h-8 w-8 rounded-md p-1 hover:cursor-pointer hover:bg-yellow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </a>
          <a :title="`Remove ${label(data) ?? `item`}`" class="h-8 w-8 rounded-md p-1 hover:cursor-pointer hover:bg-red" @click.prevent="remove(data)">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </a>
        </div>
      </template>
    </PvTableColumn>
  </PvTable>
</template>

<script setup lang="ts" generic="E extends Entity">
import { type Entity } from 'layers/base/types/entity'

const props = defineProps<{
  uri: string
  columns:(string | [string, string])[]
  label?: string | ((entity: E) => string)
}>()

const { list, remove } = await fetchEntityList(props.uri)
const columns = computed(() => Object.values(props.columns).map(col => Array.isArray(col) ? col : [col, col.substring(0, 1).toUpperCase() + col.substring(1).toLowerCase()]))
const label = computed(() => (entity: E) => {
  if (typeof props.label === `string` && props.label in entity) {
    return entity[props.label as keyof E]
  } else if (typeof props.label === `function`) {
    return props.label(entity)
  } else {
    const column = columns.value.find(col => col[0] in entity)
    return column ? entity[column[0] as keyof E] : undefined
  }
})
</script>
