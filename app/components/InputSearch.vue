<template>
  <input
    type="text"
    name="search"
    :model-value="modelValue"
    :value="modelValue"
    @input="onInput($event.target.value)"
    class="grow rounded-md shadow-lg text-base-17 hover:text-accent-26 disabled:text-base-57 disabled:hover:text-base-57 dark:text-base-77 dark:hover:text-accent-36 dark:disabled:text-base-37 dark:disabled:hover:text-base-37 placeholder:italic placeholder:text-base-37 dark:placeholder:text-base-67 hover:placeholder:text-accent-26 disabled:hover:placeholder:text-base-67 dark:hover:placeholder:text-accent-36 dark:disabled:hover:placeholder:text-base-67 input text-xl bg-base-97/95 dark:bg-base-2/95 dark:border-base-37 border-base-17 hover:border-accent-26 dark:hover:border-accent-36 focus:border-accent-26 dark:focus:border-accent-36 focus:ring-1 focus:ring-accent-26 dark:focus:ring-accent-36"
    placeholder="Search for specimens"
  />
</template>

<script lang="ts" setup>
defineModel<string>()
const props = defineProps<{
  timeout?: number
}>()
const emits = defineEmits()

let timeout: ReturnType<typeof setTimeout>
function onInput(search: string) {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    emits('update:modelValue', search)
  }, props.timeout ?? 0)
}
</script>