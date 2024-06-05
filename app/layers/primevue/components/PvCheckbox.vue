<template>
  <div class="inline-flex" :class="wrapperClass">
    <input
      :id="id"
      v-model="value"
      type="checkbox"
      :name="name"
      v-bind="attrs"
      class="input-checkbox"
      :class="classList"
    >
    <label :for="id" class="input-checkbox-label" :class="labelClass">{{ label }}</label>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  label: string
  labelClass?: string
  wrapperClass?: string
  modelValue?: boolean
}>()

const emits = defineEmits<{
  change: [value: boolean]
  // eslint-disable-next-line
  "update:modelValue": [value: boolean]
}>()

const { name, id, class: classList, ...attrs } = useAttrs() as { name: string, id: string, class: string }
const value = computed({
  get() {
    return props.modelValue
  },
  set(value: boolean) {
    emits(`change`, value)
    emits(`update:modelValue`, value)
  },
})
</script>
