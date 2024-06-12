<template>
  <EntityForm @save="onSave" @cancel="$emit(`cancel`)">
    <TwFormField label="Location">
      <PvInputDropdown v-model="location" :options="storageOptions" option-field="self" label-field="label" class="input-select-lg" />
    </TwFormField>
    <div class="flex flex-row space-x-4">
      <TwFormField label="From">
        <TwInputText v-model="dateIn" class="input input-text-lg" />
      </TwFormField>
      <TwFormField label="Until">
        <TwInputText v-model="dateOut" class="input input-text-lg" />
      </TwFormField>
    </div>
  </EntityForm>
</template>

<script setup lang="ts">
import { FilterOperator } from '@unb-libraries/nuxt-layer-entity'
import { type Storage } from '~/types/specimen'
import { type StorageLocation } from '~/types/storagelocation'

const props = defineProps<{
  storage?: Storage
}>()

const location = ref<string>(props.storage?.location.self ?? ``)
const dateIn = ref<string>(props.storage?.dateIn?.substring(0, 10) ?? ``)
const dateOut = ref<string | undefined>(props.storage?.dateOut?.substring(0, 10))

const emits = defineEmits<{
  save: [storage: Storage]
  cancel: []
}>()

const { entities: storageOptions } = await fetchEntityList<StorageLocation>(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `storageLocation`]] })

function onSave() {
  emits(`save`, {
    id: props.storage?.id,
    location: {
      self: location.value,
      label: storageOptions.value.find(option => option.self === location.value)?.label,
    },
    dateIn: dateIn.value,
    dateOut: dateOut.value,
  })
}
</script>
