<template>
  <div :class="wrapperClass">
    <slot />
    <div class="flex h-8 text-sm leading-8" v-bind="attrs">
      <span v-if="error" class="text-red-600" :class="errorClass">
        <slot name="error" :error="error">
          {{ error }}
        </slot>
      </span>
      <span v-else-if="help" class="text-primary-40" :class="helpClass">
        <slot name="help" :help="help">
          {{ help }}
        </slot>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()

const props = defineProps<{
  error?: string
  help?: string
  wrapperClass?: string
  errorClass?: string
  helpClass?: string
}>()

const setError = inject<(id: string, error: string) => void>(`setError`)
const unsetError = inject<(id: string) => void>(`unsetError`)

watch(() => props.error, (error) => {
  if (error) {
    setError?.(``, error)
  } else {
    unsetError?.(``)
  }
})
</script>
