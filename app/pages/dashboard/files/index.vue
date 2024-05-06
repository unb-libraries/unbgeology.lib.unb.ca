<template>
  <PvEntityTable :entities="files" :columns="[`filename`, `type`, `filesize`, `uploadName`, [`actions`, ``]]">
    <template #type="{ value: type }">
      {{ type ?? `other` }}
    </template>
    <template #actions="{ entity: file }">
      <div class="invisible flex flex-row justify-end space-x-2 group-hover:visible group-focus:visible">
        <button class="bg-red hover:bg-red-light rounded-md px-2 py-1 hover:cursor-pointer" @click.prevent="onDelete(file)">
          Delete
        </button>
      </div>
    </template>
  </PvEntityTable>
  <PvFileUpload @accepted="onAccepted" />
</template>

<script setup lang="tsx">
import { type File, type EntityJSONList, type EntityJSON } from "@unb-libraries/nuxt-layer-entity"
import { PvEntityDeleteConfirm } from "#components"

definePageMeta({
  layout: `dashboard`,
})

const { entities: files, remove, refresh } = await fetchEntityList<File>(`File`)

async function onAccepted(formData: FormData, upload: (formData: FormData) => Promise<EntityJSONList<File> | null>) {
  formData.append(`persisted`, `${true}`)
  await upload(formData)
  refresh()
}

function onDelete(file: EntityJSON<File>) {
  const { setContent, close: closeModal } = useModal()
  const onConfirm = async () => {
    await remove(file)
    closeModal()
  }
  setContent(<PvEntityDeleteConfirm entity={file} label="filename" onConfirm={onConfirm} onCancel={closeModal} />)
}
</script>
