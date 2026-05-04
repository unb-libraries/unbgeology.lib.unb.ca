<template>
  <TwInput :error="error" :help="help" :wrapper-class="wrapperClass">
    <div
      class="input"
      :class="classes"
    >
      <slot name="before" />
      <textarea
        :id="id"
        v-model="value"
        :rows="rows ?? 5"
        type="text"
        :name="name"
        v-bind="attrs"
        class="textarea-ref"
        :class="inputClass"
      />
      <slot name="after" />
    </div>
  </TwInput>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const value = defineModel<string | undefined>()

const props = defineProps<{
  help?: string
  labelClass?: string
  inputClass?: string
  wrapperClass?: string
  rows?: number
  validator?:(value: string) => boolean | string | Promise<boolean | string>
}>()

const emits = defineEmits<{
  validated: [id: string, valid: boolean | string, msg?: string]
}>()

const parentAttrs = inject<Partial<{ id: string, name: string }>>(`attrs`)
const { id = parentAttrs?.id ?? useId(), name = parentAttrs?.name, class: classList, ...attrs } = useAttrs() as { id: string, name: string, class: string }

const error = ref(``)
const classes = computed(() => `${classList}${error.value ? ` border-red-600 has-[:focus]:ring-red-600 text-red-600` : ``}`)

watch(() => value, async (newValue) => {
  if (props.validator && newValue.value) {
    try {
      const validOrMessage = await props.validator(newValue.value)
      const isValid = validOrMessage === true
      error.value = typeof validOrMessage === `string` ? validOrMessage : ``
      emits(`validated`, id, isValid, error.value)
    } catch (err: unknown) {
      error.value = (err as Error).message
      emits(`validated`, id, false, error.value)
    }
  }
})
</script>
