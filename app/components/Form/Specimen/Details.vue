<template>
  <EntityForm :entity="data" @save="onSave" @cancel="$emit(`cancel`)">
    <TwFormField label="Classification">
      <InputSpecimenClassification
        v-model="data.classification"
        :type="specimen.type"
        option-field="self"
        label-field="label"
        class="input-select-lg"
      />
    </TwFormField>
    <div class="flex flex-row space-x-4">
      <TwFormField label="Age" class="w-full">
        <TwInputRadioGroup v-model="ageType" :options="[[`unit`, `Geochronologic unit`],[`numeric`, `Numeric`]]" class="flex flex-row space-x-6 py-4" />
        <InputSpecimenGeoAge v-show="ageType === `unit`" v-model="data.ageRelative" />
        <TwInputNumber v-show="ageType === `numeric`" v-model="data.ageNumeric" class="input-number-lg" />
      </TwFormField>
    </div>
    <TwFormField v-if="[`fossil`, `rock`].includes(specimen.type)" label="Composition">
      <InputSpecimenComposition
        v-model="data.composition"
        :type="(specimen.type as `fossil` | `rock`)"
        class="input-select-lg"
        option-field="self"
        label-field="label"
      />
    </TwFormField>
    <div class="flex w-full flex-row space-x-2">
      <TwFormField label="Pieces" class="w-1/2">
        <TwInputNumber v-model="data.pieces" :min="1" class="input input-text-lg" />
      </TwFormField>
      <TwFormField v-if="specimen.type === `fossil`" label="Portion" class="w-1/2">
        <InputSpecimenPortion
          v-model="data.portion"
          option-field="self"
          label-field="label"
          class="input-select-lg"
        />
      </TwFormField>
    </div>
    <PvCheckbox v-model="data.partial" label="Partial" class="input-checkbox" />
    <TwFormField label="Measurements">
      <InputSpecimenMeasurements v-model="data.measurements" :pieces="data.pieces" />
    </TwFormField>
  </EntityForm>
</template>

<script setup lang="ts">
import { type Fossil, type Rock, type Specimen } from 'types/specimen'

const props = defineProps<{
  specimen: Specimen
}>()

const emits = defineEmits<{
  save: [specimen: Specimen]
  cancel: []
}>()

const ageType = ref<`unit` | `numeric`>(props.specimen.age?.numeric ? `numeric` : `unit`)
const data = reactive({
  classification: props.specimen.classification?.self,
  ageNumeric: props.specimen.age?.numeric && (props.specimen.age.numeric / 1e6),
  ageRelative: props.specimen.age?.unit?.self,
  composition: (props.specimen as Fossil | Rock).composition?.entities.map(c => c.self),
  pieces: props.specimen.pieces || 1,
  partial: props.specimen.partial,
  portion: props.specimen.type === `fossil` ? (props.specimen as Fossil).portion?.self : undefined,
  measurements: props.specimen.measurements,
})

const onSave = () => {
  const { classification, ageNumeric, ageRelative, composition, pieces, partial, portion, measurements } = data

  const payload = {
    classification: classification ?? (props.specimen.classification ? null : undefined),
    age: ageType.value === `numeric`
      ? ((ageNumeric && ageNumeric * 1e6) || (props.specimen.age ? null : undefined))
      : (ageRelative || (props.specimen.age ? null : undefined)),
    composition: composition || ((props.specimen as Fossil | Rock).composition ? null : undefined),
    pieces,
    partial,
    portion: portion || ((props.specimen as Fossil).portion ? null : undefined),
    measurements,
  }
  emits(`save`, payload)
}
</script>
