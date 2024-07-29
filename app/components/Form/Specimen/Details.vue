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
        <TwInputRadioGroup v-model="ageType" :options="[[`unit`, `Relative`],[`numeric`, `Numeric`]]" class="flex flex-row space-x-6 py-4" />
        <div v-show="ageType === `unit`" class="flex flex-row space-x-2">
          <InputSpecimenGeoAge v-model="data.ageRelative[0]" name="age-relative-0" @select="onSelectUnit">
            <template #before>
              <label class="text-primary-40 mr-1 italic" for="age-relative-0">
                Earliest:
              </label>
            </template>
          </InputSpecimenGeoAge>
          <InputSpecimenGeoAge v-model="data.ageRelative[1]" :filter="latestUnitFilter">
            <template #before>
              <div class="text-primary-40 mr-1 italic">
                Latest:
              </div>
            </template>
          </InputSpecimenGeoAge>
        </div>
        <div v-show="ageType === `numeric`" class="flex w-1/2 flex-row space-x-2">
          <TwInputNumber v-model="data.ageNumeric[0]" :min="0" class="input-number-lg w-full">
            <template #before>
              <div class="text-primary-40 mr-1 italic">
                Earliest:
              </div>
            </template>
          </TwInputNumber>
          <TwInputNumber v-model="data.ageNumeric[1]" :min="0" :max="data.ageNumeric[0]" class="input-number-lg w-full">
            <template #before>
              <div class="text-primary-40 mr-1 italic">
                Latest:
              </div>
            </template>
          </TwInputNumber>
        </div>
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
import type { Unit } from '~/types/geochronology'

const props = defineProps<{
  specimen: Specimen
}>()

const emits = defineEmits<{
  save: [specimen: Specimen]
  cancel: []
}>()

const data = reactive({
  classification: props.specimen.classification?.self,
  ageNumeric: props.specimen.age.numeric?.map(n => n / 1e6) ?? [],
  ageRelative: props.specimen.age.relative?.map(u => u.self) ?? [],
  composition: (props.specimen as Fossil | Rock).composition?.entities.map(c => c.self),
  pieces: props.specimen.pieces || 1,
  partial: props.specimen.partial,
  portion: props.specimen.type === `fossil` ? (props.specimen as Fossil).portion?.self : undefined,
  measurements: props.specimen.measurements,
})

const ageType = ref<`unit` | `numeric`>(props.specimen.age?.numeric?.length ? `numeric` : `unit`)
const latestUnitFilter = ref<(unit: Unit) => boolean>()
watch(data.ageNumeric, () => {
  if (data.ageNumeric[0] < data.ageNumeric[1]) {
    data.ageNumeric[1] = data.ageNumeric[0]
  }
})

function onSelectUnit(earliest: Unit | undefined) {
  if (!earliest) {
    data.ageRelative = []
    latestUnitFilter.value = () => false
  } else {
    latestUnitFilter.value = latest => latest.division === earliest.division && latest.start <= earliest.start && latest.self !== earliest.self
  }
}

const onSave = () => {
  const { classification, ageNumeric, ageRelative, composition, pieces, partial, portion, measurements } = data

  const payload = {
    classification: classification ?? (props.specimen.classification ? null : undefined),
    age: ageType.value === `numeric`
      ? (ageNumeric.filter(n => n).length && ageNumeric.filter(a => !isNaN(a)).map(age => age * 1e6)) || (props.specimen.age?.relative ? null : undefined)
      : (ageRelative.filter(r => r).length && ageRelative.filter(a => a)) || (props.specimen.age?.numeric ? null : undefined),
    composition: composition || ((props.specimen as Fossil | Rock).composition ? null : undefined),
    pieces,
    partial,
    portion: portion || ((props.specimen as Fossil).portion ? null : undefined),
    measurements,
  }
  emits(`save`, payload)
}
</script>
