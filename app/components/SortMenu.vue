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
        :items="props"
        item-class="rounded-md"
        @changed="([key, [, direction]], ranking) => $emit(`changed`, key, direction, ranking)"
      />
    </PvContextualDropdown>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  props: [string, [string, 1 | 0 | -1]][]
}>()

defineEmits<{
  changed: [prop: string, direction: 1 | 0 | -1, props: [string, [string, 1 | 0 | -1]][]]
}>()

const visible = ref(false)
</script>
