<template>
  <PvInputDropdown
    v-model="portion"
    :options="options"
    option-field="self"
    label-field="label"
    class="input-select-lg"
    :add-new-option="true"
  />
</template>

<script setup lang="ts">
import { FilterOperator } from '@unb-libraries/nuxt-layer-entity'
import useEntityFormModal from '~/layers/primevue/composables/useEntityFormModal'
import type { Portion } from '~/types/portion'
import { TermForm } from '#components'

const portion = defineModel<string>({ required: false })
const { entities: options, add: createPortion } = await fetchEntityList(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `portion`]] })

watch(portion, (current, previous) => {
  if (current === `addNew`) {
    const { open: openModal } = useEntityFormModal<Portion>(TermForm, {
      onSave: async (values: Portion) => {
        const { entity: newCollection } = await createPortion({ ...values, type: `portion` })
        nextTick(() => {
          portion.value = newCollection.value?.self
        })
      },
    })
    openModal()
    portion.value = previous
  }
})
</script>
