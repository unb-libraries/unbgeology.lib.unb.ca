<template>
  <div class="flex w-full flex-col">
    <label :class="labelClass" class="mb-2 align-middle text-lg font-bold" :for="name">
      <slot name="label">{{ label }}</slot>
    </label>
    <div
      class="bg-base dark:bg-primary disabled:bg-primary-80 disabled:text-primary-40 border-primary-20 dark:border-primary-60/75 hover:border-accent-light has-[:focus]:ring-2 has-[:focus]:ring-accent-light has-[:focus]:hover:border-transparent flex flex-row items-center space-x-2 rounded-lg border p-3 py-0"
      :class="classes"
    >
      <slot name="before" />
      <slot :attrs="{ id, name, ...attrs }" />
      <slot name="after" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  label: string
  labelClass?: string
  inputClass?: string
}>()

const kebabLabel = props.label.toLowerCase().replace(/\s/g, `-`)
const { id = `input-${kebabLabel}`, name = kebabLabel, class: classes, ...attrs } = useAttrs() as { id: string, name: string, class: string, placeholder: string }
</script>
