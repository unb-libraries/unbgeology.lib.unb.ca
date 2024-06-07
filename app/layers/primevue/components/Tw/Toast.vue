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
        class="button-sm cursor-pointer font-semibold uppercase"
        :class="{
          'button-red hover:button-red-dark': type === `error`,
          'button-primary-80 hover:button-primary': type === `info`,
          'button-yellow hover:button-yellow-dark': type === `warning`,
          'button-green hover:button-green-dark': type === `success`,
        }"
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
}>(), {
  type: `info`,
  duration: -1,
})

if (props.duration > 0) {
  setTimeout(() => removeToast(id), props.duration)
}
</script>
