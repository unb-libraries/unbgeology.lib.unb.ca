<template>
  <div>
    <PvSortableList v-if="sortedItems.length" :items="sortedItems" :class="[listClass, sortedListClass].join(` `)" :item-class="[itemClass, sortedItemClass].join(` `)" @moved="onMoved">
      <template #default="{ key, item: [label, direction], index, moveTop, move }">
        <div class="flex w-full flex-row justify-between rounded-sm px-3 py-2">
          <div class="space-x-2">
            <span>{{ label }}</span>
            <a class="text-primary-40 cursor-pointer text-xs hover:underline" @click.stop.prevent="update(key, direction * -1 as SortDirection)">
              {{ (direction > 0 && `ASC`) || (direction < 0 && `DESC`) || `` }}
            </a>
          </div>
          <div class="invisible inline-flex space-x-2 group-hover:visible">
            <a v-if="index > 0" class="cursor-pointer hover:underline" @click.stop.prevent="move(key, -1)">Up</a>
            <a v-if="index > 0" class="cursor-pointer hover:underline" @click.stop.prevent="moveTop(key)">Top</a>
            <a class="cursor-pointer hover:underline" @click.stop.prevent="remove(key)">Remove</a>
          </div>
        </div>
      </template>
    </PvSortableList>
    <ul :class="[listClass, unsortedListClass].join(` `)">
      <li v-for="[key, label] in unsortedItems" :key="key" class="group" :class="[itemClass, unsortedItemClass]" @click.stop.prevent="add(key, 1)">
        <div class="flex w-full flex-row justify-between rounded-sm px-3 py-2">
          <div class="space-x-2">
            {{ label }}
          </div>
          <div class="invisible inline-flex space-x-2 group-hover:visible">
            <a class="cursor-pointer hover:underline" @click.stop.prevent="add(key, 1)">ASC</a>
            <a class="cursor-pointer hover:underline" @click.stop.prevent="add(key, -1)">DESC</a>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
type SortDirection = 1 | 0 | -1

const props = defineProps<{
  sortedItems: [string, [string, SortDirection]][]
  listClass?: string
  sortedListClass?: string
  unsortedListClass?: string
  itemClass?: string
  sortedItemClass?: string
  unsortedItems: [string, string][]
  unsortedItemClass?: string
}>()

const items = computed(() => props.sortedItems.concat(props.unsortedItems.map(([key, label]) => [key, [label, 0]])))

const emits = defineEmits<{
  itemChanged: [item: [string, [string, SortDirection]], items: [string, [string, SortDirection]][]]
}>()

const update = (key: string, direction: SortDirection) => {
  const item = items.value.find(([k]) => k === key)!
  const updatedItems = items.value
    .map<[string, [string, SortDirection]]>(([k, item]) => k === key ? [k, [item[0], direction]] : [k, item])
  emits(`itemChanged`, item, updatedItems)
}

const add = (key: string, direction?: SortDirection) => {
  update(key, direction ?? 1)
}

const remove = (key: string) => {
  update(key, 0)
}

const onMoved = (item: [string, [string, SortDirection]], index: number, items: [string, [string, SortDirection]][]) => {
  emits(`itemChanged`, item, items)
}
</script>
