<template>
  <div v-if="modelValue" :id="id" v-on-window="hide" class="absolute" :class="classList">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  modelValue?: boolean
  triggerId?: string
}>()

const emits = defineEmits<{
  // eslint-disable-next-line
  "update:modelValue": [value: boolean]
}>()

const { id = `context-menu-${Math.floor(Math.random() * 1000)}`, class: classList } = useAttrs() as { id?: string, class?: string }
const visible = computed({
  get() {
    return props.modelValue ?? false
  },
  set(value: boolean) {
    emits(`update:modelValue`, value)
  },
})

const isTarget = (el: HTMLElement, id: string): boolean =>
  el.id === id
    ? true
    : el.parentElement ? isTarget(el.parentElement, id) : false

const hide = (event: Event) => {
  const target = event.target as HTMLElement
  if (event.target && !isTarget(target, id) && (!props.triggerId || !isTarget(target, props.triggerId))) {
    visible.value = false
  }
}
</script>
