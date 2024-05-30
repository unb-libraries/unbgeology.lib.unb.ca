<template>
  <TermForm :entity="unit" :type="type" :parents="parents" @save="t => onSave(t as unknown as Unit)">
    <template #default="{ body }">
      <TwFormField label="Parent">
        <PvInputDropdown v-model="body.parent" :options="parents" option-field="self" label-field="label" class="input-select-lg" />
      </Twformfield>
      <TwFormField label="Division">
        <PvInputDropdown v-model="body.division" :options="divisions" option-field="self" label-field="label" class="input-select-lg" />
      </TwFormField>
      <div class="inline-flex w-full space-x-4">
        <TwFormField label="Upper boundary" class="w-1/4">
          <TwInputText v-model="body.boundaries.upper" class="input input-text-lg" />
        </TwFormField>
        <TwFormField label="Lower boundary" class="w-1/4">
          <TwInputText v-model="body.boundaries.lower" class="input input-text-lg" />
        </TwFormField>
        <TwFormField label="Uncertainty" class="w-1/4">
          <TwInputText v-model="body.uncertainty" class="input input-text-lg" />
        </TwFormField>
        <TwFormField label="Color" class="w-1/4">
          <TwInputText v-model="body.color" class="input input-text-lg" />
        </TwFormField>
      </div>
      <PvCheckbox v-model="body.gssp" label="GSSP" />
    </template>
  </TermForm>
</template>

<script setup lang="ts">
import { FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import type { Unit, UnitFormData } from "~/types/geochronology"
import { Division } from "~/types/geochronology"

const props = defineProps<{
  unit?: Unit
}>()

const emits = defineEmits<{
  save: [unit: Unit]
}>()

const unit = reactive<UnitFormData>({
  label: props.unit?.label ?? ``,
  parent: props.unit?.parent,
  division: props.unit?.division ?? undefined,
  boundaries: {
    upper: `${props.unit?.boundaries?.upper ?? ``}`,
    lower: `${props.unit?.boundaries?.lower ?? ``}`,
  },
  uncertainty: `${props.unit?.uncertainty ?? 0}`,
  gssp: props.unit?.gssp ?? true,
  color: props.unit?.color ?? ``,
})

const type = `geochronology`
const { fetchAll } = useEntityType<Unit, UnitFormData>(`Term`)
const { entities: parents } = await fetchAll({ filter: [[`type`, FilterOperator.EQUALS, type]] })
const divisions = useEnum(Division).toTuples().map<[string, string]>(([value, label]) => [`${value}`, titleCased(label)])

function onSave({ boundaries, uncertainty, ...values }: UnitFormData) {
  const unit = {
    ...values,
    uncertainty: parseInt(uncertainty),
    boundaries: {
      upper: parseInt(boundaries.upper),
      lower: parseInt(boundaries.lower),
    },
    type,
  } as Unit
  emits(`save`, unit)
}
</script>
