<template>
  <TwInput :error="error" :help="help" :wrapper-class="wrapperClass">
    <div
      class="input"
      :class="classes"
    >
      <slot name="before" />
      <slot>
        <input
          :id="id"
          v-model="numeric"
          type="text"
          :name="name"
          v-bind="attrs"
          class="input-ref"
          :class="inputClass"
        >
      </slot>
      <div class="flex flex-col -space-y-1">
        <button @click.stop.prevent="numeric ||= 0; numeric++">
          <IconAngleUp class="hover:stroke-accent-mid stroke-primary-40 h-4 w-4 fill-none stroke-2" />
        </button>
        <button @click.stop.prevent="numeric ||= 0; numeric--">
          <IconAngleDown class="stroke-primary-40 hover:stroke-accent-mid h-4 w-4 fill-none stroke-2" />
        </button>
      </div>
    </div>
  </TwInput>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const numeric = defineModel<number>(`modelValue`, { required: false })
const props = defineProps<{
  min?: number
  max?: number
  help?: string
  inputClass?: string
  wrapperClass?: string
  validator?:(value: number) => boolean | string | Promise<boolean | string>
}>()

const emits = defineEmits<{
  validated: [id: string, valid: boolean | string, msg?: string]
}>()

const parentAttrs = inject<Partial<{ id: string, name: string }>>(`attrs`)
const { id = parentAttrs?.id ?? useId(), name = parentAttrs?.name, class: classList, ...attrs } = useAttrs() as { id: string, name: string, class: string }

const error = ref(``)
const classes = computed(() => `${classList}${error.value ? ` border-red-600 has-[:focus]:ring-red-600 text-red-600` : ``}`)

// watch(value, onChange)
watch(numeric, (updated, previous) => {
  const { min, max } = props
  if (isNaN(Number(updated))) {
    numeric.value = previous
  } else if (updated && min !== undefined && updated < min) {
    numeric.value = previous
  } else if (updated && max !== undefined && updated > max) {
    numeric.value = previous
  }
})

watch(numeric, async (value) => {
  if (value && props.validator) {
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
})
</script>
