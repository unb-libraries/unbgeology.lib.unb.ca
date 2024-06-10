<template>
  <EntityForm :entity="data" @save="onSave" @cancel="$emit(`cancel`)">
    <TwFormField label="Classification">
      <InputSpecimenClassification
        v-model="data.classification"
        :type="specimen.type"
        :options="classifications"
        option-field="self"
        label-field="label"
        class="input-select-lg"
      />
    </TwFormField>
    <div class="flex flex-row space-x-4">
      <TwFormField label="Age" class="w-full">
        <InputSpecimenGeoAge v-model="data.age" />
      </TwFormField>
    </div>
    <TwFormField label="Composition">
      <TwInputText class="input input-text-lg" />
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
import { FilterOperator } from '@unb-libraries/nuxt-layer-entity'
import { type Fossil, type Specimen } from 'types/specimen'

const props = defineProps<{
  specimen: Specimen
}>()

const emits = defineEmits<{
  save: [specimen: Specimen]
  cancel: []
}>()

const { entities: classifications } = await fetchEntityList(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `classification/${props.specimen.type}`]] })

const data = reactive({
  classification: props.specimen.classification?.self,
  age: props.specimen.age?.numeric ?? props.specimen.age?.unit?.self,
  // composition: props.specimen.composition ?? [],
  pieces: props.specimen.pieces || 1,
  partial: props.specimen.partial,
  portion: props.specimen.type === `fossil` ? (props.specimen as Fossil).portion?.self : undefined,
  measurements: props.specimen.measurements,
})

console.log(`input`, props.specimen)
console.log(`form-input`, data)

const onSave = () => {
  console.log(`form-output`, data)
  const { classification, age, pieces, partial, measurements } = data

  const payload = {
    classification: classification ?? (props.specimen.classification ? null : undefined),
    age: age || (props.specimen.age ? null : undefined),
    pieces,
    partial,
    portion: (props.specimen.type === `fossil` && data.portion) || ((props.specimen as Fossil).portion ? null : undefined),
    measurements,
  }

  console.log(`payload`, payload)
  emits(`save`, payload)
}
</script>
