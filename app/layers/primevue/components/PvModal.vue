<template>
  <Teleport to="body">
    <div class="bg-primary-60/75 fixed left-0 top-0 z-[1000] h-screen w-screen" :class="overlayClass">
      <div class="bg-primary max-h-4/5 absolute left-1/4 top-12 w-1/2 overflow-y-scroll rounded-lg p-8" :class="modalClass">
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  overlayClass?: string
  modalClass?: string
}>()
</script>
