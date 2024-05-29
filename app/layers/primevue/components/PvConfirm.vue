<template>
  <div>
    <h1 class="mb-12 text-2xl" :class="contentClass">
      <slot>
        {{ question }}
      </slot>
    </h1>
    <div class="text-center" :class="actionsClass">
      <button class="bg-red hover:bg-red-light mr-2 w-24 rounded-md p-2" :class="confirmClass" @click.stop.prevent="emits(`confirm`)">
        {{ confirmLabel ?? `Yes` }}
      </button>
      <button class="bg-accent-mid hover:bg-accent-light mr-2 w-24 rounded-md p-2" :class="cancelClass" @click.stop.prevent="emits(`cancel`)">
        {{ cancelLabel ?? `No` }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  question?: string
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
