<template>
  <div :class="[`form-field group`, classList]">
    <slot name="before" :label="label" :name="name" :required="required">
      <div :class="[`form-field-before`, beforeClass]">
        <label :class="[`form-field-label`, labelClass]" :for="name">
          <slot name="label" :label="label">{{ label }}</slot>
        </label>
        <slot v-if="required" name="required" :required="required">
          <span :class="[`form-field-required`, requiredClass]">(required)</span>
        </slot>
      </div>
    </slot>
    <slot v-bind="{ id, name, required, ...attrs }" />
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
  beforeClass?: string
  required?: boolean
  requiredClass?: string
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
