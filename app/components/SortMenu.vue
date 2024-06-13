<template>
  <div>
    <a id="button-sort" class="button button-md hover:button-primary-80" @click.prevent="visible = !visible">
      Sort
    </a>
    <PvContextualDropdown
      v-model="visible"
      trigger-id="button-sort"
      class="context-menu"
      @click.stop.prevent="visible = !visible"
    >
      <PvSortableEntityPropertyList
        :items="props.map(([key, label, direction]) => [key, [label, direction]])"
        item-class="rounded-md"
        @changed="([key, [, direction]], ranking) => $emit(`changed`, key as T, direction, ranking.map(([id, [label, sort]]) => [id as T, label, sort]))"
      />
    </PvContextualDropdown>
  </div>
</template>

<script setup lang="ts" generic="T extends string">
defineProps<{
  props: [T, string, 1 | 0 | -1][]
}>()

defineEmits<{
  changed: [prop: T, direction: 1 | 0 | -1, props: [T, string, 1 | 0 | -1][]]
}>()

const visible = ref(false)
</script>
