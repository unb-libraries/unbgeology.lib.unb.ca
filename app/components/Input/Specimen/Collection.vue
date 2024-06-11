<template>
  <PvInputDropdown
    v-model="collection"
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
import { type Collection } from '~/types/collection'
import { TermForm } from '#components'
import useEntityFormModal from '~/layers/primevue/composables/useEntityFormModal'

const collection = defineModel<string>({ required: false })

const { entities: options, add: createCollection } = await fetchEntityList<Collection>(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `collection`]], select: [`label`] })

function onAdd() {
  const { open: openModal } = useEntityFormModal<Collection>(TermForm, {
    onSave: async (values: Collection) => {
      const { entity: newCollection } = await createCollection({ ...values, type: `collection` })
      nextTick(() => {
        if (newCollection.value) {
          collection.value = newCollection.value?.self
        }
      })
    },
  })
  openModal()
}
</script>
