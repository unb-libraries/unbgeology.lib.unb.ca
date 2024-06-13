<template>
  <EntityForm @save="onSave" @cancel="$emit(`cancel`)">
    <TwFormField label="Storage location history">
      <div v-if="Object.keys(storage).length > 0" class="space-y-2">
        <div v-for="({ id, location: { label }, dateIn, dateOut }, index) in Object.values(storage)" :key="id" class="flex flex-row space-x-4 px-2 py-1">
          <div class="bg-primary-80 flex w-24 items-center justify-center rounded-md text-xs uppercase">
            <span v-if="index < 1">{{ dateIn.substring(0, 10) }}</span>
            <span v-else>{{ dateOut?.substring(0, 10) ?? `present` }}</span>
          </div>
          <div>
            @ {{ label }}
          </div>
        </div>
      </div>
      <div v-else>
        Unrecorded
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
      storage.value = Object.fromEntries(Object.entries({ ...storage.value, [id]: { ...values, id } })
        .sort(([, { dateIn: a }], [, { dateIn: b }]) => new Date(a).valueOf() - new Date(b).valueOf()))
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
