<template>
  <PvInputDropdown
    v-model="unit"
    :options="units"
    option-field="self"
    label-field="label"
    class="input-select-lg"
    placeholder="Select a geochronologic time unit"
    :add-new-option="true"
    @add="onAdd"
  />
</template>

<script setup lang="ts">
import { FilterOperator } from '@unb-libraries/nuxt-layer-entity'
import useEntityFormModal from '~/layers/primevue/composables/useEntityFormModal'
import { FormGeochronology } from '#components'
import { type Unit } from '~/types/geochronology'

const unit = defineModel<string>({ required: false })
const { entities: units, add: createUnit } = await fetchEntityList(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `geochronology`]], select: [`label`], sort: [`label`], pageSize: 500 })
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
</script>
