<template>
  <PvEntityTable :entities="files" :columns="[`filename`, `type`, `filesize`, `uploadName`]">
    <template #type="{ value: type }">
      {{ type ?? `other` }}
    </template>
  </PvEntityTable>
  <PvFileUpload @accepted="onAccepted" />
</template>

<script setup lang="ts">
import { type File, type EntityJSONList } from "@unb-libraries/nuxt-layer-entity"

definePageMeta({
  layout: `dashboard`,
})

const { entities: files, refresh } = await fetchEntityList<File>(`File`)

async function onAccepted(formData: FormData, upload: (formData: FormData) => Promise<EntityJSONList<File> | null>) {
  formData.append(`persisted`, `${true}`)
  await upload(formData)
  refresh()
}
</script>
