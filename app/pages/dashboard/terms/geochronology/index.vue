<template>
  <div class="space-y-24">
    <section>
      <header class="flex flex-row justify-between">
        <h2 class="mb-6 text-2xl">
          Geochronology
        </h2>
        <div class="space-x-1">
          <button class="form-action form-action-submit p-2 font-normal" @click.prevent="content = { component: GeochronologyForm, props: { entity: { boundaries: {}}}, eventHandlers: { save: onCreateUnit, cancel: () => closeModal()}}">
            Create
          </button>
        </div>
      </header>
      <PvEntityTable :entities="units" :columns="[`label`, `division`, [`actions`, ``]]">
        <template #division="{ value: division }">
          {{ division.substring(0, 1).toUpperCase() + division.substring(1).toLowerCase() }}
        </template>
        <template #actions="{ entity: term }">
          <PvDefaultEntityTableActions
            :entity="term"
            label="label"
            :form="GeochronologyForm"
            :form-props="{ parents: units }"
            :update="updateUnit"
            :remove="removeUnit"
            class="invisible group-hover:visible group-focus:visible"
          />
        </template>
        <template #footer>
          <span v-if="unitList?.total" class="italic">{{ pluralize(unitList?.total, `term`, `terms`) }}</span>
        </template>
      </PvEntityTable>
    </section>
  </div>
</template>

<script setup lang="ts">
import { type Unit } from 'types/vocabularies/geochronology'
import { type EntityJSONBody } from "@unb-libraries/nuxt-layer-entity"
import { GeochronologyForm } from '#components'

definePageMeta({
  layout: `dashboard`,
})

const { content, close: closeModal } = useModal()

const { list: unitList, entities: units, add: addUnit, update: updateUnit, remove: removeUnit } = await fetchEntityList<Unit>(`Geochronology`)
async function onCreateUnit(unit: EntityJSONBody<Unit>) {
  await addUnit(unit)
  closeModal()
}
</script>
