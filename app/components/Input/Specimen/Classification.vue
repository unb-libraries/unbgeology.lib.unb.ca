<template>
  <PvInputDropdown
    v-model="classification"
    :options="options"
    option-field="self"
    label-field="label"
    class="input-select-lg"
    item-class="even:bg-primary-80/40 hover:even:bg-accent-mid py-1 group"
    selected-item-class="bg-accent-mid even:bg-accent-mid hover:bg-accent-light even:hover:bg-accent-light"
    :add-new-option="true"
    @add="onAdd"
  >
    <template #item="{ options: [option, label, selected] }">
      <div class="flex flex-col">
        <span>{{ label }}</span>
        <span class="group-hover:text-primary-80 text-xs italic" :class="{ 'text-primary-20': !selected, 'text-primary-80': selected }">
          {{ options.find(op => op.self === option)?.ancestors?.entities.map(acs => acs.label).reverse().join(` &raquo; `) ?? `&nbsp;` }}
        </span>
      </div>
    </template>
  </PvInputDropdown>
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

// FIX: Dynamically load all, e.g. on scroll, instead of setting fixed pageSize
const { entities: options, add: createClassification } = await fetchEntityList(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `classification/${props.type}`]], select: [`label`, `ancestors`], sort: [`label`], pageSize: 500 })
function onAdd() {
  const { open: openModal } = useEntityFormModal<Classification>(Form, {
    onSave: async (values: Classification) => {
      const { entity: newCollection } = await createClassification({ ...values, type: `classification/${props.type}` })
      nextTick(() => {
        if (newCollection.value) {
          classification.value = newCollection.value?.self
        }
      })
    },
  })
  openModal()
}
</script>
