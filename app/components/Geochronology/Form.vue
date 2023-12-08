<template>
  <TaxonomyTermForm :term="term" :parents="units">
    <template #default="{ body }">
      <div class="form-row">
        <div class="form-field grow">
          <label for="division" class="font-bold">Division</label>
          <PvInputSelect v-model="body.division" class="form-input form-input-pvselect" :options="divisions" option-value="0" option-label="1" />
        </div>

        <div class="form-field">
          <label for="color">Color code</label>
          <PvColorPicker v-model="body.color" name="color" :pt="{ input: { class: `form-input form-input-color` }}" />
        </div>
      </div>

      <div class="form-row form-row-3">
        <div class="form-field">
          <label for="boundary-upper">Upper boundary</label>
          <PvInputNumber v-model="body.boundaries.upper" input-class="form-input form-input-number" max-fraction-digits="2" min-fraction-digits="2" name="boundary-upper" />
        </div>

        <div class="form-field">
          <label for="boundary-upper">Lower boundary</label>
          <PvInputNumber v-model="body.boundaries.lower" input-class="form-input form-input-number" max-fraction-digits="2" min-fraction-digits="2" name="boundary-lower" />
        </div>

        <div class="form-field">
          <label for="uncertainty">Uncertainty</label>
          <PvInputNumber v-model="body.uncertainty" input-class="form-input form-input-number" max-fraction-digits="2" min-fraction-digits="2" name="uncertainty" />
        </div>
      </div>
      <PvCheckbox id="gssp" v-model="body.gssp" name="gssp" label="GSSP ratified" />
    </template>
  </TaxonomyTermForm>
</template>

<script setup lang="ts">
import { type Unit, Division } from "types/vocabularies/geochronology"
import { type EntityJSONProperties } from "layers/base/types/entity"

defineProps<{
  term: EntityJSONProperties<Unit>
}>()

const { entities: units } = await fetchEntityListItems<Unit>(`Geochronology`)
const divisions = Object.entries(Division).map(([value, label]) => [value.toLowerCase(), label.at(0)!.toUpperCase() + label.substring(1)])
</script>
