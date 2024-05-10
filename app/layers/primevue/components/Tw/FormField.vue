<template>
  <div class="flex flex-col" :class="classes">
    <label :class="labelClass" class="mb-2 align-middle text-lg font-bold" :for="name">
      <slot name="label">{{ label }}</slot>
    </label>
    <slot v-bind="{ id, name, label, ...attrs }" />
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
const { id = `input-${kebabLabel}`, name = kebabLabel, class: classes, ...attrs } = useAttrs() as { id: string, name: string, class: string }

provide(`attrs`, {
  id,
  name,
  label: props.label,
  ...attrs,
})
</script>
