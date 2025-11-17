<template>
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
    <button v-if="(maxDecimals ?? Infinity) - (minDecimals ?? 0) > 0"
        type="button"
        @click.stop="decimals = Math.max(minDecimals ?? 0, decimals - 1)"
      >
        <IconDecimalsLess class="hover:stroke-accent-mid stroke-primary-40 size-5 fill-none stroke-2 p-0" />
    </button>
    <button v-if="(maxDecimals ?? Infinity) - (minDecimals ?? 0) > 0"
        type="button"
        @click.stop="decimals = Math.min(maxDecimals ?? Infinity, decimals + 1)"
      >
        <IconDecimalsMore class="hover:stroke-accent-mid stroke-primary-40 size-5 fill-none stroke-2 p-0" />
    </button>
    <div class="flex flex-col -space-y-1">
      <button @click.stop.prevent="numeric = String((Number(numeric ?? min ?? 0)) + 1)">
        <IconAngleUp class="hover:stroke-accent-mid stroke-primary-40 size-4 fill-none stroke-2 p-0" />
      </button>
      <button @click.stop.prevent="numeric = String((Number(numeric ?? min ?? 0)) - 1)">
        <IconAngleDown class="stroke-primary-40 hover:stroke-accent-mid size-4 fill-none stroke-2 p-0" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const value = defineModel<number>(`modelValue`, { required: false })
const props = defineProps<{
  min?: number
  max?: number
  help?: string
  inputClass?: string
  wrapperClass?: string
  minDecimals?: number
  maxDecimals?: number
  validator?: (value: number) => boolean | string | Promise<boolean | string>
}>()

const decimals = ref(0)
const numeric = computed({
  get: () => String(value.value?.toFixed(decimals.value) ?? ``),
  set: (newValue: string) => {
    const { min, max } = props
    const num = Number(newValue)
    if (!isNaN(num) && (max === undefined || num <= max) && (min === undefined || num >= min)) {
      value.value = num
    }
  },
})

const emits = defineEmits<{
  validated: [id: string, valid: boolean | string, msg?: string]
}>()

const parentAttrs = inject<Partial<{ id: string, name: string }>>(`attrs`)
const { id = parentAttrs?.id ?? useId(), name = parentAttrs?.name, class: classList, ...attrs } = useAttrs() as { id: string, name: string, class: string }

const error = ref(``)
const classes = computed(() => `${classList}${error.value ? ` border-red-600 has-[:focus]:ring-red-600 text-red-600` : ``}`)
</script>
