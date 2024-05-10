<template>
  <div
    class="bg-base dark:bg-primary disabled:bg-primary-80 disabled:text-primary-40 border-primary-20 dark:border-primary-60/75 hover:border-accent-light has-[:focus]:ring-2 has-[:focus]:ring-accent-light has-[:focus]:hover:border-transparent flex flex-row items-center space-x-2 rounded-lg border p-3 py-0"
    :class="classes"
  >
    <slot name="before" />
    <input
      :id="id"
      v-model="value"
      :name="name"
      v-bind="attrs"
      class="placeholder:text-primary dark:placeholder:text-primary-20 w-full border-none bg-inherit px-0 py-2 placeholder:italic focus:ring-0 dark:text-base"
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
