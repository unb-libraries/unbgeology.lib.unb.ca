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
      :multiple="(maxFiles ?? 2) > 1"
      @change="e => onSelect(Array.from(e.target?.files))"
      @click.stop=""
    >
    <slot>
      <IconImages class="size-12 fill-none stroke-current" />
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
  maxFiles?: number
  maxFileSize?: number
  maxTotalFileSize?: number
  validators?: Validator[]
}>()

const emits = defineEmits<{
  drop: [files: File[]],
  error: [msg: string, file?: File],
}>()

const dragover = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function onClick() {
  fileInput.value?.click()
}

function onDrop({ dataTransfer }: DragEvent) {
  dragover.value = false
  if (dataTransfer?.items) {
    onReceive(Object.values(dataTransfer.items)
      .map(item => item.getAsFile())
      .filter(file => file) as File[])
  } else if (dataTransfer?.files) {
    onReceive(Object.values(dataTransfer.files))
  }
}

const onSelect = function (files: File[]) {
  onReceive(files)
}

const onReceive = function (files: File[]) {
  const validators = props.validators ?? []
  let batchSize = 0

  const accepted = files.slice(0, Math.max(0, props.maxFiles ?? files.length)).filter((file) => {
    if (props.maxFileSize && file.size > props.maxFileSize) {
      emits(`error`, `Maximum allowed size exceeded.`, file)
      return false
    }

    if ((batchSize += file.size) > (props.maxTotalFileSize ?? Infinity)) {
      return false
    }

    return true
  })

  if (batchSize > (props.maxTotalFileSize ?? Infinity)) {
    emits(`error`, `Total file size exceeds maximum allowed size. ${files.length - accepted.length} files were ignored.`)
  }

  const validated = accepted.filter((file) => {
    const valid = validators.every(validator => !validator(file))
    if (!valid) {
      // TODO: Print error for each validator.
      emits(`error`, `Invalid file`, file)
      return false
    }
    return true
  })

  if (validated.length > 0) {
    emits(`drop`, validated)
  }
}

</script>
