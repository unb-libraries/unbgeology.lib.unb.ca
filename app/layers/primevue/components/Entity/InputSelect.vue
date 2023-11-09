<template>
  <PvInputSelect v-model="selected" :multi="multi" :options="options" :option-label="optionLabel" option-value="self" />
</template>

<script setup lang="ts" generic="E extends Entity = Entity, M extends boolean = false">
import { type Entity, type EntityJSON } from 'layers/base/types/entity'

const props = defineProps<{
  multi?: M
  options: EntityJSON<E>[]
  optionLabel:((entity: EntityJSON<E>) => string) | keyof EntityJSON<E>
  modelValue?: M extends false ? string : string[]
}>()

const emits = defineEmits<{
  // eslint-disable-next-line
  'update:modelValue': [uri: M extends false ? string : string[]],
}>()

const selected = computed({
  get() {
    return props.modelValue ?? (!props.multi ? `` : []) as M extends false ? string : string[]
  },
  set(value: M extends false ? string : string[]) {
    emits(`update:modelValue`, value)
  },
})

</script>
