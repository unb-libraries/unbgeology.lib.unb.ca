<template>
  <div class="flex w-fit flex-row rounded-md px-3 py-2" :class="{ 'bg-accent-dark': type === `success`, 'bg-red-light': type === `error`, 'bg-primary-80': type === `info`, 'bg-yellow': type === `warn`}">
    <div class="flex flex-row items-center space-x-3">
      <div>
        <slot />
      </div>
      <button class="button-red hover:button-red-dark button-sm cursor-pointer font-semibold uppercase" @click.stop.prevent="removeToast($attrs.id as string)">
        <!-- <IconCancel class="fill-primary-60 stroke-base hover:fill-red-dark stroke-1.5 h-6 w-6" /> -->
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
