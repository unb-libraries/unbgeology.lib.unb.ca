<template>
  <div class="inline-flex" :class="wrapperClass">
    <input
      :id="id"
      v-model="value"
      type="checkbox"
      :name="name"
      class="bg-base dark:bg-primary dark:border-primary-60/75 hover:border-accent-light checked:text-accent-mid h-6 w-6 cursor-pointer rounded-md border focus:ring-0 focus:ring-offset-0"
    >
    <label :for="id" class="mx-3 cursor-pointer">{{ label }}</label>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  label: string
  modelValue: boolean
}>()

const emits = defineEmits<{
  change: [value: boolean]
  // eslint-disable-next-line
  "update:modelValue": [value: boolean]
}>()

const { name, id, class: wrapperClass } = useAttrs() as { name: string, id: string, class: string }
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
