<template>
  <button
    class="button button-lg button-outline-primary-60 flex w-full flex-col items-center justify-center space-y-2 rounded-none border-2 border-dashed p-8"
    :class="{ 'bg-accent-mid button-outline-base': dragover }"
    @drop.prevent="onDrop"
    @dragover.prevent=""
    @dragenter="dragover = true"
    @dragexit="dragover = false"
    @click.stop.prevent="onClick"
  >
    <input
      ref="fileInput"
      class="hidden"
      type="file"
      multiple
      @change="e => onSelect(Array.from(e.target?.files))"
      @click.stop=""
    >
    <slot>
      <IconImages class="h-12 w-12 fill-none stroke-current" />
      <span>
        Drop or browse files
      </span>
    </slot>
  </button>
</template>

<script setup lang="ts" generic="T extends FileEntity = FileEntity">
import { type File as FileEntity } from "@unb-libraries/nuxt-layer-entity"
type Validator = ((file: File) => string | boolean | void)

const props = defineProps<{
  label?: string
  validators?: Validator[]
}>()

const emits = defineEmits<{
  drop: [files: File[]],
}>()

const dragover = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function onClick() {
  fileInput.value?.click()
}

function onDrop({ dataTransfer }: DragEvent) {
  let files: File[] = []
  if (dataTransfer?.items) {
    files = Object.values(dataTransfer.items)
      .map(item => item.getAsFile())
      .filter(file => file) as File[]
  } else if (dataTransfer?.files) {
    files = Object.values(dataTransfer.files)
  }
  const validators = props.validators ?? []
  emits(`drop`, files.filter(file => validators.every(validator => !validator(file))))
}

const onSelect = function (files: File[]) {
  const validators = props.validators ?? []
  emits(`drop`, files.filter(file => validators.every(validator => !validator(file))))
}

</script>
