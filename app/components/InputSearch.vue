<template>
  <input
    type="text"
    name="search"
    :model-value="modelValue"
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    class="grow rounded-md shadow-lg text-base-17 dark:text-base-77 placeholder:text-base-37 dark:placeholder:text-base-67 placeholder:italic input text-xl bg-base-97/95 dark:bg-base-2/95 dark:border-base-37 border-base-17 hover:border-accent-26 dark:hover:border-accent-36 hover:text-accent-26 dark:hover:text-accent-36 hover:placeholder:text-accent-26 dark:hover:placeholder:text-accent-36 focus:border-accent-26 dark:focus:border-accent-36 focus:ring-1 focus:ring-accent-26 dark:focus:ring-accent-36"
    placeholder="Search for specimens"
  />
</template>

<script lang="ts" setup>
defineModel<string>()
</script>