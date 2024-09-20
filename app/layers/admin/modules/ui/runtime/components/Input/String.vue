<template>
  <div :class="[`input-text-wrapper`, classList]">
    <div :class="[`input-text-before`, theme?.class?.before]">
      <slot name="before" />
    </div>
    <input v-model="value" type="text" :required="required"
      :class="[`input-text`, theme?.class?.input, { [theme?.class?.inputInvalid ?? `invalid`]: valid !== undefined && !valid }]"
      v-bind="attrs" @blur.stop="validate(value)">
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
const { valid, errors, validate } = useValidate(props.required && [RequiredValidator(), ...props.validators] || props.validators)
watch(errors, errors => emits(`validated`, errors.length === 0, errors))
</script>
