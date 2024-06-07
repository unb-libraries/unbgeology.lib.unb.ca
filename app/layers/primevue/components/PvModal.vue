<template>
  <Teleport v-if="isOpen" to="body">
    <div class="bg-primary-60/75 fixed left-0 top-0 z-[1000] h-screen w-screen" :class="overlayClass" @click="close()">
      <div class="bg-primary max-w-4/5 min-w-1/3 max-h-4/5 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-y-scroll rounded-lg p-8" :class="modalClass" @click.stop="">
        <slot>
          <!-- for backwards compatibility -->
          <component :is="ModalContent!.component" v-if="isDyanmicContent" v-bind="ModalContent!.props" v-on="ModalContent!.eventHandlers" />
          <!-- Prefer this -->
          <ModalContent v-else />
        </slot>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  overlayClass?: string
  modalClass?: string
}>()

const isDyanmicContent = computed(() => ModalContent.value?.component)

const { isOpen, content: ModalContent, close } = useModal()
</script>
