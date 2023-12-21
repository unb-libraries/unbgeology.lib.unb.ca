<template>
  <div class="bg-primary-20 dark:bg-primary-80 mt-2 p-8 text-center" @drop.prevent="onDrop" @dragover.prevent="">
    Drop files here.
  </div>
</template>

<script setup lang="ts" generic="T extends IFile = IFile">
import { type File as IFile, type EntityJSON, type EntityJSONList } from 'layers/base/types/entity'

const props = defineProps<{
  types?: string[]
  maxFileSize?: number
  persist?: boolean
}>()

const emits = defineEmits<{
  accepted: [formData: FormData, upload:(formData: FormData) => Promise<EntityJSONList<T> | null>],
  uploaded: [file: EntityJSON<T>[]],
}>()

const onDrop = function ({ dataTransfer }: DragEvent) {
  const formData = new FormData()

  const accepted = (file: File) => {
    const types = props.types ?? []
    const maxSize = props.maxFileSize ?? 100000000
    return (types.length < 1 || types.includes(file.type)) &&
      maxSize >= file.size
  }

  const upload = async (formData: FormData) => {
    const { data: entities } = await useFetch<EntityJSONList<T>>(`/api/upload`, {
      method: `POST`,
      body: formData,
    })
    return entities.value
  }

  let acceptedFiles: File[] = []
  if (dataTransfer?.items) {
    acceptedFiles = Object.values(dataTransfer.items)
      .map(item => item.getAsFile())
      .filter(file => file)
      .filter((file) => {
        return accepted(file!)
      }) as File[]
  } else if (dataTransfer?.files) {
    acceptedFiles = Object.values(dataTransfer.files).filter(file => accepted(file))
  }

  acceptedFiles.forEach(file => formData.append(`files`, file))
  emits(`accepted`, formData, upload)
}
</script>
