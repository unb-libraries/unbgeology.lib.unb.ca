<template>
  <ul>
    <slot name="before" />
    <li v-for="([key, item], index) in normItems" :key="key" class="group cursor-pointer" :class="itemClass">
      <slot
        :key="key"
        :item="(item as T)"
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

<script setup lang="ts" generic="T = any">
const props = defineProps<{
  items:(string|[string, T])[]
  itemClass?: string | string[]
}>()

const emits = defineEmits<{
  moved: [item: [string, T], index: number, list: [string, T][]]
}>()

const normItems = computed<[string, T][]>(() => props.items.map(item => Array.isArray(item) ? item : [item, item as T]))
function move(id: string, offset: number) {
  const index = normItems.value.findIndex(([key]) => key === id)
  if (index >= 0) {
    const [min, max] = [-index, normItems.value.length - index]
    const safeOffset = Math.max(min, Math.min(max, offset))

    const resorted = [...normItems.value]
    const [item] = resorted.splice(index, 1)
    resorted.splice(index + safeOffset, 0, item)
    const newIndex = resorted.findIndex(([key]) => key === id)

    emits(`moved`, item, newIndex, resorted)
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
