<template>
  <div>
    <TwInputRadioGroup v-model="type" :options="typeOptions" class="flex flex-row space-x-6 py-4" />
    <PvInputDropdown
      v-if="type === `unit`"
      v-model="unit"
      :options="units"
      option-field="self"
      label-field="label"
      class="input-select-lg"
      placeholder="Select a geochronologic time unit"
      :add-new-option="true"
      @add="onAdd"
    />
    <TwInputNumber v-else-if="type === `numeric`" v-model="numeric" class="input-number-lg" />
  </div>
</template>

<script setup lang="ts">
import { FilterOperator } from '@unb-libraries/nuxt-layer-entity'
import useEntityFormModal from '~/layers/primevue/composables/useEntityFormModal'
import { FormGeochronology } from '#components'
import { type Unit } from '~/types/geochronology'

const age = defineModel<string | number>({ required: false })
const unit = ref(typeof age.value === `string` ? age.value : undefined)
const numeric = ref(typeof age.value === `number` ? age.value : undefined)

const typeOptions = [
  [`unit`, `Geochronologic unit`],
  [`numeric`, `Numeric`],
] as [string, string][]

const type = ref<`unit` | `numeric`>(typeof age.value === `number` ? `numeric` : `unit`)

const { entities: units, add: createUnit } = await fetchEntityList(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `geochronology`]] })
function onAdd() {
  const { open: openModal } = useEntityFormModal<Unit>(FormGeochronology, {
    onSave: async (values: Unit) => {
      const { entity: newUnit } = await createUnit({ ...values, type: `geochronology` })
      nextTick(() => {
        if (newUnit.value) {
          unit.value = newUnit.value?.self
        }
      })
    },
  })
  openModal()
}

watch(unit, (unit) => { age.value = unit })
watch(numeric, (numeric) => { age.value = numeric })
watch(type, (type) => {
  age.value = type === `unit`
    ? unit.value
    : numeric.value
})
</script>
