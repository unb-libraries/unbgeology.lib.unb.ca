<template>
  <div
    class="flex w-fit flex-row rounded-md px-3 py-2"
    :class="{
      'bg-green-light text-primary': type === `success`,
      'bg-red-light': type === `error`,
      'bg-primary-60': type === `info`,
      'bg-yellow-light text-primary': type === `warning`,
    }"
  >
    <div class="flex flex-row items-center space-x-3">
      <div>
        <slot />
      </div>
      <button
        v-for="action in actions"
        :key="action.label"
        class="button-sm cursor-pointer font-semibold uppercase"
        :class="buttonClass"
        @click.stop.prevent="onAction(action)"
      >
        {{ action.label }}
      </button>
      <button
        class="button-sm cursor-pointer font-semibold uppercase"
        :class="buttonClass"
        @click.stop.prevent="removeToast($attrs.id as string)"
      >
        Dismiss
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { removeToast } = useToasts()
const { id } = useAttrs() as { id: string }

const props = withDefaults(defineProps<{
  type?: `info` | `success` | `warning` | `error`
  duration?: number
  actions?: ToastAction[]
}>(), {
  type: `info`,
  duration: -1,
  actions: () => [],
})

const buttonClass = computed(() => ({
  'button-red hover:button-red-dark': props.type === `error`,
  'button-primary-80 hover:button-primary': props.type === `info`,
  'button-yellow hover:button-yellow-dark': props.type === `warning`,
  'button-green hover:button-green-dark': props.type === `success`,
}))

const onAction = async (action: ToastAction) => {
  removeToast(id)
  await action.onClick()
}

if (props.duration > 0) {
  setTimeout(() => removeToast(id), props.duration)
}
</script>
