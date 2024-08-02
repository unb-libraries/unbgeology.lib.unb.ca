<template>
  <div class="text-primary-40 flex-none space-y-2">
    <div class="relative">
      <TwInputFileDrop :max-file-size="maxFileSize" :max-total-file-size="maxTotalFileSize" :max-files="maxFiles" @drop="onFilesDropped" @error="e => error = e" />
      <div v-if="uploading" class="bg-base/80 absolute left-0 top-0 flex size-full items-center justify-center">
        <PvProgressSpinner class="size-9" stroke-width="8" />
      </div>
    </div>
    <slot v-if="!error && maxFiles !== undefined" name="legend">
      <div class="flex flex-col">
        <span>Upload up to {{ maxFiles }} images</span>
        <span v-if="maxTotalFileSize">Max. size: {{ maxTotalFileSize / 1024 / 1024 }} MB</span>
        <span v-if="maxFileSize">Max. size/image: {{ maxFileSize / 1024 / 1024 }} MB</span>
      </div>
    </slot>
    <slot v-else-if="error" name="error">
      <div class="bg-red-light group rounded-lg px-3 py-2 text-base">
        <div class="flex flex-row justify-between">
          <span>{{ error }}</span>
          <button class="button button-sm button-red-dark hover:button-red" @click.prevent.stop="error = undefined">
            Dismiss
          </button>
        </div>
      </div>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import { type File as FileEntity } from '@unb-libraries/nuxt-layer-entity'

withDefaults(defineProps<{
  maxFiles?: number
  maxFileSize?: number
  maxTotalFileSize?: number
}>(), {
  maxFiles: 25,
  maxFileSize: 1024 * 1024 * 100,
  maxTotalFileSize: 1024 * 1024 * 200,
})

const emits = defineEmits<{
  upload: [files: FileEntity[]]
  error: [msg: string, file?: FileEntity]
}>()

const uploading = ref(false)
const error = ref<string | undefined>()

watch(error, msg => msg && emits(`error`, msg))

function onFilesDropped(files: File[]) {
  const { data, error: uploadError } = useFileUpload(files)
  uploading.value = true
  watch(data, (files) => {
    uploading.value = false
    emits(`upload`, files.entities)
  }, { once: true })
  watch(uploadError, (msg) => {
    error.value = `${msg}`
    uploading.value = false
  }, { once: true })
}
</script>
