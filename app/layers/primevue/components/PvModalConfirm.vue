<template>
  <PvModal :modal-class="modalClass">
    <p :class="contentClass">
      <slot />
    </p>
    <div class="text-center" :class="actionsClass">
      <button class="bg-red mr-2 w-24 rounded-md p-2" :class="confirmClass" @click="emits(`confirm`)">
        {{ confirmLabel ?? `Yes` }}
      </button>
      <button class="bg-accent-mid mr-2 w-24 rounded-md p-2" :class="cancelClass" @click="emits(`cancel`)">
        {{ cancelLabel ?? `No` }}
      </button>
    </div>
  </PvModal>
</template>

<script setup lang="ts">
defineProps<{
  modalClass?: string
  contentClass?: string
  confirmLabel?: string
  confirmClass?: string
  cancelLabel?: string
  cancelClass?: string
  actionsClass?: string
}>()

const emits = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>
