<template>
  <PvInputDropdown
    v-model="unit"
    :options="options"
    option-field="self"
    label-field="label"
    class="input-select-lg"
    item-class="even:bg-primary-80/40 hover:even:bg-accent-mid py-1 group"
    selected-item-class="bg-accent-mid even:bg-accent-mid hover:bg-accent-light even:hover:bg-accent-light"
    placeholder="Select a geochronologic time unit"
    :add-new-option="true"
    @add="onAdd"
  >
    <template #before>
      <slot name="before" />
    </template>
    <template #item="{ options: [option, label, selected] }">
      <div class="flex flex-col">
        <span>{{ label }}</span>
        <span class="group-hover:text-primary-80 text-xs italic" :class="{ 'text-primary-20': !selected, 'text-primary-80': selected }">
          {{ units.find(op => op.self === option)?.ancestors?.entities.map(acs => acs.label).reverse().join(` &raquo; `) ?? `&nbsp;` }}
        </span>
      </div>
    </template>
  </PvInputDropdown>
</template>

<script setup lang="ts">
import { FilterOperator } from '@unb-libraries/nuxt-layer-entity'
import useEntityFormModal from '~/layers/primevue/composables/useEntityFormModal'
import { FormGeochronology } from '#components'
import { type Unit } from '~/types/geochronology'

const props = defineProps<{
  filter?:(unit: Unit) => boolean
}>()

const emits = defineEmits<{
  select: [unit: Unit | undefined]
}>()

const unit = defineModel<string>({ required: false })
const { entities: units, add: createUnit } = await fetchEntityList<Unit>(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `geochronology`]], select: [`label`, `ancestors`, `division`, `start`], sort: [`label`], pageSize: 500 })
const options = computed(() => props.filter ? units.value.filter(props.filter) : units.value)
watch(unit, unit => emits(`select`, units.value.find(op => op.self === unit)), { immediate: true })

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
