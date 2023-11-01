<template>
  <div class="bg-primary-20 dark:bg-primary-80 mt-2 p-8 text-center" @drop.prevent="onDrop" @dragover.prevent="">
    Drop files here.
  </div>
</template>

<script setup lang="ts" generic="T extends FileEntity">
import { type File as FileEntity, type EntityJSON, type EntityJSONList } from 'layers/base/types/entity'

const props = defineProps<{
  types?: string[]
  maxFileSize?: number
  persist?: boolean
}>()

const emits = defineEmits<{
  uploaded: [file: EntityJSON<T>[]],
}>()

const onDrop = async function ({ dataTransfer }: DragEvent) {
  const accepted = (file: File) => {
    const types = props.types ?? []
    const maxSize = props.maxFileSize ?? 100000000
    return (types.length < 1 || types.includes(file.type)) &&
      maxSize >= file.size
  }

  if (dataTransfer?.items) {
    for (const item of dataTransfer.items) {
      const file = item.getAsFile()
      if (file && accepted(file)) {
        formData.append(`files`, file)
      }
    }
  } else if (dataTransfer?.files) {
    for (const file of dataTransfer.files) {
      if (accepted(file)) {
        formData.append(`files`, file)
      }
    }
  }

  const { data: uploadedFiles } = await useFetch<EntityJSONList<FileEntity>>(`/api/upload`, {
    method: `POST`,
    body: formData,
  })

  if (uploadedFiles.value) {
    formData.delete(`files`)
    emits(`uploaded`, uploadedFiles.value.entities)
  }
}

const formData = new FormData()
formData.append(`persisted`, `${props.persist ?? true}`)
</script>
