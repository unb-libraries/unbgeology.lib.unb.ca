<template>
  <div
    class="input"
    :class="classes"
  >
    <slot name="before" />
    <slot>
      <input
        :id="id"
        v-model="value"
        type="text"
        :name="name"
        v-bind="attrs"
        class="input-ref"
        :class="inputClass"
      >
    </slot>
    <slot name="after" />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  help?: string
  labelClass?: string
  inputClass?: string
  wrapperClass?: string
  modelValue?: string
  validator?:(value: string) => boolean | string | Promise<boolean | string>
}>()

const emits = defineEmits<{
  // eslint-disable-next-line
  'update:modelValue': [value: string]
  validated: [id: string, valid: boolean | string, msg?: string]
}>()

const value = computed({
  get: () => props.modelValue,
  set: (value: string) => emits(`update:modelValue`, value),
})

const parentAttrs = inject<Partial<{ id: string, name: string }>>(`attrs`)
const { id = parentAttrs?.id ?? useId(), name = parentAttrs?.name, class: classList, ...attrs } = useAttrs() as { id: string, name: string, class: string }

const error = ref(``)
const classes = computed(() => `${classList}${error.value ? ` border-red-600 has-[:focus]:ring-red-600 text-red-600` : ``}`)

watch(() => props.modelValue, onChange)
async function onChange(value: string) {
  if (props.validator) {
    try {
      const validOrMessage = await props.validator(value)
      const isValid = validOrMessage === true
      error.value = typeof validOrMessage === `string` ? validOrMessage : ``
      emits(`validated`, id, isValid, error.value)
    } catch (err: unknown) {
      error.value = (err as Error).message
      emits(`validated`, id, false, error.value)
    }
  }
}
</script>
