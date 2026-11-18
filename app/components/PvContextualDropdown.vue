<template>
  <div v-if="modelValue" :id="id" v-on-window="hide" class="absolute z-10" :class="classList">
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

// Use the event path rather than walking parentElement: clicking can re-render
// (and detach) the target before this handler runs, e.g. expanding a tree node.
const isTarget = (event: Event, id: string): boolean =>
  event.composedPath().some(el => (el as HTMLElement).id === id)

// Overlays teleported to <body> (e.g. tree select panels) opt in to being treated as inside.
const isKeepOpen = (event: Event): boolean =>
  event.composedPath().some(el => (el as HTMLElement).hasAttribute?.(`data-keep-dropdown-open`))

const hide = (event: Event) => {
  if (isKeepOpen(event)) {
    return
  }
  if (!isTarget(event, id) && (!props.triggerId || !isTarget(event, props.triggerId))) {
    visible.value = false
  }
}
</script>
