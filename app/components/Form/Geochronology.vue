<template>
  <EntityForm @save="onSave" @cancel="$emit(`cancel`)">
    <TwFormField label="Label">
      <TwInputText v-model="label" class="input input-text-lg" />
    </TwFormField>
    <TwFormField label="Parent">
      <PvInputDropdown v-model="parent" :options="parents" option-field="self" label-field="label" class="input-select-lg" />
    </TwFormField>
    <TwFormField label="Division">
      <PvInputDropdown v-model="division" :options="divisions" option-field="self" label-field="label" class="input-select-lg" />
    </TwFormField>
    <div class="inline-flex w-full space-x-4">
      <TwFormField label="Lower boundary" class="w-1/3">
        <TwInputText v-model="start" class="input input-text-lg" />
      </TwFormField>
      <TwFormField label="Uncertainty" class="w-1/3">
        <TwInputText v-model="uncertainty" class="input input-text-lg" />
      </TwFormField>
      <TwFormField label="Color" class="w-1/3">
        <TwInputText v-model="color" class="input input-text-lg" />
      </TwFormField>
    </div>
    <PvCheckbox v-model="gssp" label="GSSP" />
  </EntityForm>
</template>

<script setup lang="ts">
import { FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import type { Unit, UnitFormData } from "~/types/geochronology"

const props = defineProps<{
  unit?: Unit
}>()

const emits = defineEmits<{
  save: [unit: Unit]
  cancel: []
}>()

const label = ref(props.unit?.label)
const parent = ref(props.unit?.parent?.self)
const division = ref(props.unit?.division)
const start = ref(props.unit?.start)
const uncertainty = ref(props.unit?.uncertainty)
const color = ref(props.unit?.color)
const gssp = ref(props.unit?.gssp)

const type = `geochronology`
const { fetchAll } = useEntityType<Unit, UnitFormData>(`Term`)
const { entities: parents } = await fetchAll({ filter: [[`type`, FilterOperator.EQUALS, type]], select: [`label`], sort: [`label`], pageSize: 500 })
const divisions = [
  [`eon`, `Eon`],
  [`era`, `Era`],
  [`period`, `Period`],
  [`subperiod`, `Subperiod`],
  [`epoch`, `Epoch`],
  [`age`, `Age`],
]

function onSave() {
  emits(`save`, {
    label: label.value || (props.unit?.label ? null : undefined),
    parent: parent.value || (props.unit?.parent ? null : undefined),
    division: division.value || (props.unit?.division ? null : undefined),
    start: start.value || (props.unit?.start ? null : undefined),
    uncertainty: uncertainty.value || (props.unit?.uncertainty ? null : undefined),
    color: color.value || (props.unit?.color ? null : undefined),
    gssp: gssp.value || (props.unit?.gssp ? null : undefined),
    type,
  })
}
</script>
