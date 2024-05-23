<template>
  <div
    :class="classes"
  >
    <slot name="before" />
    <input
      :id="id"
      v-model="value"
      type="text"
      :name="name"
      v-bind="attrs"
      class="input-ref"
      :class="inputClass"
    >
    <slot name="after" />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  // label: string
  labelClass?: string
  inputClass?: string
  modelValue: string
}>()

const emits = defineEmits<{
  // eslint-disable-next-line
  'update:modelValue': [value: string]
}>()

const value = computed({
  get: () => props.modelValue,
  set: (value: string) => emits(`update:modelValue`, value),
})

const parentAttrs = inject<Partial<{ id: string, name: string }>>(`attrs`)
const { id = parentAttrs?.id, name = parentAttrs?.name, class: classes, ...attrs } = useAttrs() as { id: string, name: string, class: string }
</script>
