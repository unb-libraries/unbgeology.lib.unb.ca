<template>
  <PvInputDropdown
    v-model="composition"
    :multi="true"
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
import type { Composition } from '~/types/composition'
import { TermForm } from '#components'
import useEntityFormModal from '~/layers/primevue/composables/useEntityFormModal'

const composition = defineModel<string[]>({ required: false })
const props = defineProps<{
  type: `fossil` | `rock`
}>()

const { entities: options, add: createTerm } = await fetchEntityList(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `composition/${props.type}`]] })
const onAdd = () => {
  const { open: openModal } = useEntityFormModal<Composition>(TermForm, {
    onSave: async (values: Composition) => {
      const { entity: newTerm } = await createTerm({ ...values, type: `composition/${props.type}` })
      nextTick(() => {
        if (newTerm.value) {
          composition.value = [...(composition.value ?? []), newTerm.value?.self]
        }
      })
    },
  })
  openModal()
}
</script>
