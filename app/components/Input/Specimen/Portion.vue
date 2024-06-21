<template>
  <PvInputDropdown
    v-model="portion"
    :options="options"
    option-field="self"
    label-field="label"
    class="input-select-lg"
    :add-new-option="true"
    @add="onAdd"
  />
</template>

<script setup lang="ts">
import { FilterOperator } from '@unb-libraries/nuxt-layer-entity'
import useEntityFormModal from '~/layers/primevue/composables/useEntityFormModal'
import type { Portion } from '~/types/portion'
import { TermForm } from '#components'

const portion = defineModel<string>({ required: false })
const { entities: options, add: createPortion } = await fetchEntityList(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `portion`]], select: [`label`], sort: [`label`], pageSize: 500 })

function onAdd() {
  const { open: openModal } = useEntityFormModal<Portion>(TermForm, {
    onSave: async (values: Portion) => {
      const { entity: newPortion } = await createPortion({ ...values, type: `portion` })
      nextTick(() => {
        if (newPortion.value) {
          portion.value = newPortion.value?.self
        }
      })
    },
  })
  openModal()
}
</script>
