<template>
  <TwInput :label="label" :label-class="labelClass">
    <template #before>
      <slot name="before" />
    </template>
    <template #default="{ attrs }">
      <input
        :id="attrs.id"
        v-model="value"
        :name="attrs.name"
        :placeholder="attrs.placeholder"
        class="placeholder:text-primary dark:placeholder:text-primary-20 w-full border-none bg-inherit px-0 py-2 placeholder:italic focus:ring-0 dark:text-base"
        :class="inputClass"
      >
    </template>
    <template #after>
      <slot name="after" />
    </template>
  </TwInput>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
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
</script>
