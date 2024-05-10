<template>
  <div class="inline-flex space-x-2" :class="wrapperClass">
    <TwInputText v-bind="$attrs" v-model="search" name="search" :label="label" placeholder="Search">
      <template #before>
        <slot name="before" />
      </template>
    </TwInputText>
    <button
      v-if="submit"
      type="submit"
      class="bg-accent-mid hover:bg-accent-light cursor-pointer rounded-md p-2 text-base"
      :class="buttonClass"
      @click.prevent.stop="update?.()"
    >
      {{ label }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  modelValue: string
  label?: string
  delay?: number
  submit?: boolean
  wrapperClass?: string
  buttonClass?: string
}>(), {
  label: `Search`,
  delay: 500,
  wrapperClass: ``,
  buttonClass: ``,
})

const emits = defineEmits<{
  // eslint-disable-next-line
  "update:modelValue": [value: string]
}>()

const onReady = (value: string) => () => emits(`update:modelValue`, value)
const update = ref<ReturnType<typeof onReady>>()

let timeout: NodeJS.Timeout | false = false
const search = computed({
  get: () => props.modelValue,
  set: (value: string) => {
    update.value = onReady(value)
    if (!props.submit) {
      if (timeout) {
        clearTimeout(timeout)
      }
      timeout = setTimeout(() => {
        update.value!()
        timeout = false
      }, props.delay)
    }
  },
})
</script>
