<template>
  <ul class="space-y-1">
    <li v-for="([key, [label, direction]], index) in elements" :key="key" class="bg-primary-80/60 group flex w-full cursor-pointer flex-row justify-between rounded-sm px-3 py-2" :class="itemClass">
      <div class="space-x-2">
        <slot :label="label" :direction="direction" :index="index">
          <span>{{ label }}</span>
        </slot>
        <a v-if="direction" class="text-primary-40 cursor-pointer text-xs hover:underline" @click.stop.prevent="onSet(key, direction * -1 as SortDirection)">
          {{ (direction > 0 && `ASC`) || (direction < 0 && `DESC`) || `` }}
        </a>
      </div>
      <slot name="controls" :direction="direction" :list="list">
        <div v-if="direction" class="invisible inline-flex space-x-2 group-hover:visible">
          <a v-if="index > 0" class="cursor-pointer hover:underline" @click.stop.prevent="onMove(key, -1)">Up</a>
          <a v-if="index > 0" class="cursor-pointer hover:underline" @click.stop.prevent="onMove(key, -index)">Top</a>
          <a class="cursor-pointer hover:underline" @click.stop.prevent="onRemove(key)">Remove</a>
        </div>
        <div v-else class="invisible inline-flex space-x-2 group-hover:visible">
          <a class="cursor-pointer hover:underline" @click.stop.prevent="onAdd(key, 1)">ASC</a>
          <a class="cursor-pointer hover:underline" @click.stop.prevent="onAdd(key, -1)">DESC</a>
        </div>
      </slot>
    </li>
  </ul>
</template>

<script setup lang="ts">
type SortDirection = 1 | 0 | -1

const props = defineProps<{
  items: [string, [string, SortDirection]][]
  listClass?: string
  itemClass?: string
}>()

const list = useSortableList(props.items)
const { list: elements, move, moveTop, moveBottom, get, set } = list

const emits = defineEmits<{
  changed: [item: [string, [string, SortDirection]], items: [string, [string, SortDirection]][]]
}>()

function onAdd(key: string, direction: 1 | -1) {
  const item = get(key)
  if (item) {
    const [label] = item
    set(key, [label, direction])
    moveTop(key)
    emits(`changed`, [key, [label, direction]], elements.value)
  }
}

function onSet(key: string, direction: SortDirection) {
  const item = get(key)
  if (item) {
    const [label] = item
    set(key, [label, direction])
    emits(`changed`, [key, [label, direction]], elements.value)
  }
}

function onMove(key: string, offset: number) {
  const newIndex = move(key, offset)
  if (newIndex >= 0) {
    emits(`changed`, elements.value[newIndex], elements.value)
  }
}

function onRemove(key: string) {
  const item = get(key)
  if (item) {
    const [label] = item
    set(key, [label, 0])
    moveBottom(key)
    emits(`changed`, [key, [label, 0]], elements.value)
  }
}
</script>
