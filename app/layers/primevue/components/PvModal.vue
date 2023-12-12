<template>
  <Teleport v-if="isOpen" to="body">
    <div class="bg-primary-60/75 fixed left-0 top-0 z-[1000] h-screen w-screen" :class="overlayClass" @click="close()">
      <div class="bg-primary max-h-4/5 max-w-4/5 absolute left-1/2 top-1/2 w-fit -translate-x-1/2 -translate-y-1/2 overflow-y-scroll rounded-lg p-8" :class="modalClass" @click.stop="">
        <component :is="content!.component" v-bind="content!.props" v-on="content!.eventHandlers" />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  overlayClass?: string
  modalClass?: string
}>()

const { isOpen, content, close } = useModal()
</script>
