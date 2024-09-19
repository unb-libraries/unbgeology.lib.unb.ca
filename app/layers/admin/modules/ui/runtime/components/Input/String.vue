<template>
  <div :class="[`input-text-wrapper`, classList]">
    <div :class="[`input-text-before`, theme?.class?.before]">
      <slot name="before" />
    </div>
    <input v-model="value" type="text"
      :class="[`input-text`, theme?.class?.input, { [theme?.class?.inputInvalid ?? `invalid`]: valid !== undefined && !valid }]"
      v-bind="attrs" @blur.stop="onBlur">
    <div :class="[`input-text-after`, theme?.class?.after]">
      <slot name="after" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ValidatedInputProps, ValidatedInputEmits, ThemedComponentProps } from '#build/types/unb-libraries-nuxt-ui'

defineOptions({
  inheritAttrs: false,
})

const value = defineModel<string>({ required: false, default: `` })
const props = defineProps<ThemedComponentProps<[`input`, `inputInvalid`, `before`, `after`]> & ValidatedInputProps<string>>()
const emits = defineEmits<ValidatedInputEmits>()

const { class: classList, ...attrs } = useInputAttrs()
const valid = ref()

function onBlur() {
  const errors = (props.validators ?? [])
    .map(validator => validator(value.value) || ``)
    .filter(error => error)
  valid.value = errors.length === 0
  emits(`validated`, valid.value, errors)
}
</script>
