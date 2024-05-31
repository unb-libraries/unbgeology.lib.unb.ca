<template>
  <EntityForm :entity="data">
    <template #default="{ body }">
      <TwFormField label="Classification">
        <PvInputDropdown
          v-model="body.classification"
          :options="classifications"
          option-field="self"
          label-field="label"
          class="input-select-lg"
        />
      </TwFormField>
      <div class="flex flex-row space-x-4">
        <TwFormField label="Age (relative)" class="w-1/2">
          <PvInputDropdown
            v-model="body.age.unit"
            :options="units"
            option-field="self"
            label-field="label"
            class="input-select-lg"
          />
        </TwFormField>
        <TwFormField label="Age (numeric)" class="w-1/2">
          <TwInputText v-model="body.age.numeric" class="input input-text-lg" />
        </TwFormField>
      </div>
      <TwFormField label="Portion">
        <PvInputDropdown
          v-if="category === `fossil`"
          v-model="body.portion"
          :options="portions"
          option-field="self"
          label-field="label"
          class="input-select-lg"
        />
      </TwFormField>
      <TwFormField label="Composition">
        <!-- Composition: rock classifications for fossils, text otherwise -->
        <TwInputText v-model="body.composition" class="input input-text-lg" />
      </TwFormField>
      <TwFormField label="Pieces">
        <TwInputText v-model="body.pieces" class="input input-text-lg" />
      </TwFormField>
      <TwFormField label="Measurements">
        <TwInputText v-model="dimensions" class="input input-text-lg" placeholder="e.g. 12x20x8.5" />
      </TwFormField>
      <PvCheckbox v-model="body.partial" label="Partial" class="input-checkbox" />
    </template>
  </EntityForm>
  <!-- <section>
    <h2 class="divider">
      Specimen details
    </h2>
    <div class="form-col">
      <div class="form-row">
        <div class="form-field w-4/5">
          <label for="portion">Portion</label>
          <EntityInputSelect
            v-model="body.portion"
            :options="portions"
            option-label="label"
            class="form-input form-input-pvselect"
            name="portion"
          />
        </div>

        <div class="form-field">
          <label for="pieces">Pieces</label>
          <div class="inline-flex">
            <PvInputNumber v-model="body.pieces" input-class="form-input form-input-number rounded-r-none" name="pieces" />
            <div class="bg-primary-60 flex h-full items-center rounded-r-lg p-3">
              <PvCheckbox id="partial" v-model="body.partial" label="Partial" name="partial" />
            </div>
          </div>
        </div>
      </div>
      <div class="form-row form-row-3">
        <div class="form-field">
          <label for="age-relative">Age (relative)</label>
          <EntityInputSelect
            v-model="body.age.relative"
            class="form-input form-input-pvselect"
            name="age-relative"
            :options="ageUnits"
            option-label="label"
          />
        </div>

        <div class="form-field">
          <label for="age-numeric">Age (numeric)</label>
          <div class="inline-flex">
            <PvInputNumber
              v-model="body.age.numeric"
              name="age-numeric"
              :max-fraction-digits="2"
              :min-fraction-digits="2"
              min="0"
              class="w-full"
              input-class="form-input form-input-number rounded-r-none"
            />
            <div class="bg-primary-60 h-full rounded-r-lg p-3">
              Ma
            </div>
          </div>
        </div>

        <div class="form-field">
          <label for="composition">Composition</label>
          <PvInputSelect v-model="body.composition" class="form-input form-input-pvselect" name="composition" :options="['solid']" />
        </div>
      </div>

      <div class="form-field">
        <span class="form-field-label">Measurements</span>
        <div class="grid gap-6" :class="`grid-cols-${Math.min(4, body.pieces)}`">
          <div v-for="(_, index) in padMeasurements(body.measurements, body.pieces)" :key="index" class="form-field">
            <div class="inline-flex">
              <div class="bg-primary-60 h-full rounded-l-lg p-3">
                <label :for="`width-${index}`">W</label>
                <span class="mx-1">x</span>
                <label :for="`length-${index}`">L</label>
              </div>
              <div class="divide-primary-60/75 hover:divide-accent-light inline-flex w-full divide-x">
                <PvInputNumber v-model="body.measurements[index].width" class="w-full" input-class="form-input form-input-number border-r-0 rounded-none" :name="`width-${index}`" />
                <PvInputNumber v-model="body.measurements[index].length" class="w-full" input-class="form-input form-input-number border-l-0 rounded-none" :name="`length-${index}`" />
              </div>
              <div class="bg-primary-60 h-full rounded-r-lg p-3">
                mm
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section> -->
</template>

<script setup lang="ts">
import { FilterOperator } from '@unb-libraries/nuxt-layer-entity'
import { type Measurement, type Specimen } from 'types/specimen'

const props = defineProps<{
  specimen?: Specimen
  category: string
}>()

const emits = defineEmits<{
  save: [specimen: Specimen]
}>()

const { entities: classifications } = await fetchEntityList(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `classification/${props.category}`]] })
const { entities: units } = await fetchEntityList(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `geochronology`]] })
const { entities: portions } = await fetchEntityList(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `portion`]] })
const dimensions = ref(``)

const data = reactive({
  classification: undefined as string | undefined,
  age: {
    unit: undefined as string | undefined,
    numeric: undefined as number | undefined,
  },
  pieces: undefined as number | undefined,
  portion: undefined as string | undefined,
  composition: undefined as string | undefined,
  measurements: [] as Measurement[],
  partial: false,
})
</script>
