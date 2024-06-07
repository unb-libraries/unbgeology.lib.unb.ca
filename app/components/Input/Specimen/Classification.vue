<template>
  <PvInputDropdown
    v-model="classification"
    :options="options"
    option-field="self"
    label-field="label"
    class="input-select-lg"
    :add-new-option="true"
  />
</template>

<script setup lang="ts">
import { FilterOperator } from '@unb-libraries/nuxt-layer-entity'
import type { Classification } from '~/types/classification'
import { FormClassificationFossil, FormClassificationMineral, FormClassificationRock } from '#components'
import useEntityFormModal from '~/layers/primevue/composables/useEntityFormModal'

const classification = defineModel<string>({ required: false })
const props = defineProps<{
  type: `fossil` | `mineral` | `rock`
}>()

const Form = {
  fossil: FormClassificationFossil,
  mineral: FormClassificationMineral,
  rock: FormClassificationRock,
}[props.type]

const { entities: options, add: createClassification } = await fetchEntityList(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `classification/${props.type}`]] })
watch(classification, (current, previous) => {
  if (current === `addNew`) {
    const { open: openModal } = useEntityFormModal<Classification>(Form, {
      onCancel: () => { classification.value = previous },
      onSave: async (values: Classification) => {
        const { entity: newCollection } = await createClassification({ ...values, type: `classification/${props.type}` })
        nextTick(() => {
          classification.value = newCollection.value?.self
        })
      },
    })
    openModal()
  }
})
</script>
