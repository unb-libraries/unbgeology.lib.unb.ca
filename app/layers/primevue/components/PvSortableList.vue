<template>
  <ul>
    <slot name="before" />
    <li v-for="([key, item], index) in normItems" :key="key" class="group cursor-pointer" :class="itemClass">
      <slot
        :key="key"
        :item="item"
        :index="index"
        :move="move"
        :move-top="moveTop"
        :move-bottom="moveBottom"
      >
        <div @click.stop="moveTop(key)">
          {{ `${item}`.substring(0, 1).toUpperCase() + `${item}`.substring(1).toLowerCase() }}
        </div>
      </slot>
    </li>
    <slot name="after" />
  </ul>
</template>

<script setup lang="ts">
const props = defineProps<{
  items:(string|[string, any])[]
  itemClass?: string
}>()

const emits = defineEmits<{
  sorted: [item: [string, any], list: [string, any][]]
}>()

const normItems = computed<[string, any][]>(() => props.items.map(item => Array.isArray(item) ? item : [item, item]))
function move(id: string, offset: number) {
  const index = normItems.value.findIndex(([key]) => key === id)
  if (index >= 0) {
    const [min, max] = [-index, normItems.value.length - index]
    const safeOffset = Math.max(min, Math.min(max, offset))

    const resorted = [...normItems.value]
    const [item] = resorted.splice(index, 1)
    resorted.splice(index + safeOffset, 0, item)

    emits(`sorted`, item, resorted)
  }
}

function moveTop(id: string) {
  const index = normItems.value.findIndex(([key]) => key === id)
  if (index >= 0) {
    move(id, -index)
  }
}

function moveBottom(id: string) {
  const index = normItems.value.findIndex(([key]) => key === id)
  if (index >= 0 && index < normItems.value.length - 1) {
    move(id, normItems.value.length - index - 1)
  }
}
</script>
