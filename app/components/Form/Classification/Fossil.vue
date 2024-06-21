<template>
  <EntityForm @save="onSave" @cancel="$emit(`cancel`)">
    <TwFormField label="Label">
      <TwInputText v-model="label" class="input input-text-lg" />
    </TwFormField>
    <TwFormField label="Parent">
      <PvInputDropdown v-model="parent" :options="parents" option-field="self" label-field="label" class="input-select-lg" />
    </TwFormField>
    <TwFormField label="Rank">
      <PvInputDropdown v-model="rank" :options="ranks" class="input-select-lg" />
    </TwFormField>
  </EntityForm>
</template>

<script setup lang="ts">
import { FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import type { Fossil as Classification, FossilFormData } from "~/types/classification"

const props = defineProps<{
  classification?: Classification
}>()

const emits = defineEmits<{
  save: [classification: Classification]
  cancel: []
}>()

const label = ref(props.classification?.label ?? ``)
const parent = ref(props.classification?.parent?.self ?? ``)
const rank = ref(props.classification?.rank ?? ``)

const type = `classification/fossil`
const { fetchAll } = useEntityType<Classification, FossilFormData>(`Term`)
const { entities: parents } = await fetchAll({ filter: [[`type`, FilterOperator.EQUALS, type]], select: [`label`], sort: [`label`], pageSize: 500 })
const ranks = [
  [`domain`, `Domain`],
  [`kingdom`, `Kingdom`],
  [`phylum`, `Phylum`],
  [`subphylum`, `Subphylum`],
  [`class`, `Class`],
  [`subclass`, `Subclass`],
  [`orders`, `Orders`],
]

function onSave() {
  emits(`save`, {
    label: label.value || (props.classification?.label ? null : undefined),
    parent: parent.value || (props.classification?.parent ? null : undefined),
    rank: rank.value || (props.classification?.rank ? null : undefined),
    type: `classification/fossil`,
  })
}
</script>
