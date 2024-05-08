<template>
  <PvSortableList :items="items" :item-class="itemClass">
    <template #default="{ key: label, item: direction, index, moveTop, move }">
      <div class="flex w-full flex-row justify-between rounded-sm px-3 py-2" @click.stop.prevent="moveTop(label); $emit(`changedDirection`, label, 1)">
        <div class="space-x-2">
          <a @click.stop.prevent="">{{ label }}</a>
          <a class="text-primary-40 cursor-pointer text-xs hover:underline" @click.stop.prevent="$emit(`changedDirection`, label, direction * -1 as SortDirection)">
            {{ (direction > 0 && `ASC`) || (direction < 0 && `DESC`) || `` }}
          </a>
        </div>
        <div v-if="direction !== 0" class="invisible inline-flex space-x-2 group-hover:visible">
          <a v-if="index > 0" class="cursor-pointer hover:underline" @click.stop.prevent="move(label, -1)">Up</a>
          <a v-if="index > 0" class="cursor-pointer hover:underline" @click.stop.prevent="moveTop(label)">Top</a>
          <a class="cursor-pointer hover:underline" @click.stop.prevent="$emit(`changedDirection`, label, 0)">Remove</a>
        </div>
        <div v-else class="invisible inline-flex space-x-2 group-hover:visible">
          <a class="cursor-pointer hover:underline" @click.stop.prevent="moveTop(label); $emit(`changedDirection`, label, 1)">ASC</a>
          <a class="cursor-pointer hover:underline" @click.stop.prevent="moveTop(label); $emit(`changedDirection`, label, -1)">DESC</a>
        </div>
      </div>
    </template>
  </PvSortableList>
</template>

<script setup lang="ts">
type SortDirection = 1 | 0 | -1

const props = defineProps<{
  items: [string, SortDirection][]
  itemClass?: string
}>()

defineEmits<{
  changedDirection: [string, SortDirection]
}>()

const items = computed(() => props.items
  .map<[string, SortDirection, number]>((item, i) => [...item, i])
  .sort(([, d1, i1], [, d2, i2]) => d1 === d2
    ? 0
    : d1 === 0
      ? 1
      : d2 === 0
        ? -1
        : i1 - i2)
  .map<[string, SortDirection]>(([key, direction]) => [key, direction]))
</script>
