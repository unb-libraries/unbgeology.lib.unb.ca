<template>
  <div :class="[`form-field group`, classList]">
    <label :class="[`form-field-label`, labelClass]" :for="name">
      <slot name="label" :label="label">{{ label }}</slot>
    </label>
    <slot v-bind="{ id, name, ...attrs }" />
    <div class="form-field-footer">
      <slot name="footer" :caption="caption">
        {{ caption }}
      </slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  label: string
  labelClass?: string
  caption?: string
  captionClass?: string
  wrapperClass?: string
}>()

const {
  name = props.label.toLowerCase().replace(/\s+/g, `-`),
  id = `input-${name}`,
  class: classList,
  ...attrs
}: { id?: string, name?: string, class?: string } & Record<string, unknown> = useAttrs()
</script>
