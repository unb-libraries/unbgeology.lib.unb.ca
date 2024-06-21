<template>
  <EntityForm @save="onSave" @cancel="$emit(`cancel`)">
    <TwFormField label="Label">
      <TwInputText v-model="label" class="input input-text-lg" />
    </TwFormField>
    <TwFormField label="Parent">
      <PvInputDropdown v-model="parent" :options="parents" option-field="self" label-field="label" class="input-select-lg" />
    </TwFormField>
    <PvCheckbox v-model="isPublic" label="&quot;On-display&quot; location" label-class="font-normal" />
  </EntityForm>
</template>

<script setup lang="ts">
import { FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import type { StorageLocation, StorageLocationPayload } from "~/types/storagelocation"

const props = defineProps<{
  storageLocation?: StorageLocation
}>()

const emits = defineEmits<{
  save: [location: StorageLocationPayload]
  cancel: []
}>()

const label = ref<string | undefined>(props.storageLocation?.label)
const parent = ref<string | undefined>(props.storageLocation?.parent?.self)
const isPublic = ref<boolean>(props.storageLocation?.public || false)

const { fetchAll } = useEntityType<StorageLocation>(`Term`)
const { entities: parents } = await fetchAll({ filter: [[`type`, FilterOperator.EQUALS, `storageLocation`]], select: [`label`], sort: [`label`], pageSize: 500 })

function onSave() {
  if (label.value) {
    const payload: StorageLocationPayload = {
      label: label.value,
      public: isPublic.value,
    }

    if (parent.value) {
      payload.parent = parent.value
    }

    emits(`save`, payload)
  }
}
</script>
