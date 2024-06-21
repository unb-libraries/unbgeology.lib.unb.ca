<template>
  <EntityForm @save="onSave" @cancel="$emit(`cancel`)">
    <TwFormField label="Label">
      <TwInputText v-model="label" class="input input-text-lg" />
    </TwFormField>
    <TwFormField label="Parent">
      <PvInputDropdown v-model="parent" :options="parents" option-field="self" label-field="label" class="input-select-lg" />
    </TwFormField>
    <TwFormField label="Composition">
      <TwInputText v-model="composition" class="input input-text-lg" />
    </TwFormField>
  </EntityForm>
</template>

<script setup lang="ts">
import { FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import type { Mineral as Classification, MineralFormData } from "~/types/classification"

const props = defineProps<{
  classification?: Classification
}>()

const emits = defineEmits<{
  save: [data: MineralFormData]
  cancel: []
}>()

const label = ref(props.classification?.label)
const parent = ref(props.classification?.parent?.self)
const composition = ref(props.classification?.composition)

const type = `classification/mineral`
const { fetchAll } = useEntityType<Classification, MineralFormData>(`Term`)
const { entities: parents } = await fetchAll({ filter: [[`type`, FilterOperator.EQUALS, type]], select: [`label`], sort: [`label`], pageSize: 500 })

function onSave() {
  emits(`save`, {
    label: label.value || (props.classification?.label ? null : undefined),
    parent: parent.value || (props.classification?.parent?.self ? null : undefined),
    composition: composition.value || (props.classification?.composition ? null : undefined),
    type,
  })
}
</script>
