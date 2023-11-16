<template>
  <div class="flex h-full flex-col space-y-4">
    <div class="flex-none">
      <slot name="nav">
        <button class="hover:border-accent-mid hover:text-accent-mid w-full rounded-md border p-1" @click="emits(`unstack`)">
          Back
        </button>
      </slot>
    </div>
    <div class="grow">
      <slot />
    </div>
    <div class="flex-none empty:hidden">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
const emits = defineEmits<{
  unstack: []
}>()
</script>
