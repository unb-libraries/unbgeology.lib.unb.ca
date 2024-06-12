<template>
  <EntityForm @save="onSave" @cancel="$emit(`cancel`)">
    <TwFormField label="Storage location history">
      <div v-if="Object.keys(storage).length > 0" class="space-y-1">
        <div v-for="item of storage" :key="item.location.self" class="bg-primary-80 hover:bg-primary-60/60 rounded-md p-4 text-lg hover:cursor-pointer" @click.stop.prevent="openFormModal(item)">
          {{ item.dateIn.substring(0, 10) }} - {{ item.dateOut?.substring(0, 10) ?? `present` }} @ {{ item.location.label }}
        </div>
      </div>
      <div v-else>
        Not available
      </div>
      <div class="flex items-center justify-end rounded-md py-4">
        <button class="button button-lg button-accent-mid hover:button-accent-light" @click.stop.prevent="openFormModal()">
          Add location
        </button>
      </div>
    </TwFormField>
  </EntityForm>
</template>

<script setup lang="ts">
import { type Specimen, type Storage } from '~/types/specimen'
import useEntityFormModal from '~/layers/primevue/composables/useEntityFormModal'
import { FormSpecimenStorage, TwFormField } from '#components'

const props = defineProps<{
  specimen: Specimen
}>()

const emits = defineEmits<{
  save: [specimen: Specimen]
  cancel: []
}>()

const storage = ref<Record<string, Storage>>(Object.fromEntries(props.specimen.storage?.map(storage => [storage.id, storage]) ?? []))

function openFormModal(formInput?: Storage) {
  const { open: openModal } = useEntityFormModal<Storage>(FormSpecimenStorage, {
    onSave: (values: Storage) => {
      const id = values.id ?? Object.keys(storage.value).length + 1
      storage.value = { ...storage.value, [id]: { ...values, id } }
    },
  })
  openModal({ storage: formInput })
}

function onSave() {
  emits(`save`, {
    storage: Object.values(storage.value).map(({ location: { self }, dateIn, dateOut }) => ({
      location: self,
      dateIn: dateIn.substring(0, 10),
      dateOut: dateOut && dateOut.substring(0, 10),
    })),
  })
}
</script>
