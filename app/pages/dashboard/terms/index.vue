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
          <span class="italic">{{ pluralize(unitList?.total, `unit`, `units`) }}</span>
        </template>
      </PvEntityTable>
    </section>

    <section>
      <header class="flex flex-row justify-between">
        <h2 class="mb-6 text-2xl">
          Classifications
        </h2>
        <div class="space-x-1">
          <button class="form-action form-action-submit p-2 font-normal" @click.prevent="content = { component: TaxonomyTermForm, props: { entity: {}, parents: classifications }, eventHandlers: { save: onCreateClassification, cancel: () => closeModal()}}">
            Create
          </button>
        </div>
      </header>
      <PvEntityTable :entities="classifications" :columns="[`label`, [`actions`, ``]]">
        <template #actions="{ entity: term }">
          <PvDefaultEntityTableActions
            :entity="term"
            label="label"
            :form="TaxonomyTermForm"
            :form-props="{ parents: classifications }"
            :update="updateClassification"
            :remove="removeClassification"
            class="invisible group-hover:visible group-focus:visible"
          />
        </template>
        <template #footer>
          <span class="italic">{{ pluralize(classificationList?.total, `classification`, `classifications`) }}</span>
        </template>
      </PvEntityTable>
    </section>

    <section>
      <header class="flex flex-row justify-between">
        <h2 class="mb-6 text-2xl">
          Storage locations
        </h2>
        <div class="space-x-1">
          <button class="form-action form-action-submit p-2 font-normal" @click.prevent="content = { component: StorageLocationForm, props: { entity: {}, parents: locations }, eventHandlers: { save: onCreateLocation, cancel: () => closeModal()}}">
            Create
          </button>
        </div>
      </header>
      <PvEntityTable :entities="locations" :columns="[`label`, [`actions`, ``]]">
        <template #actions="{ entity: term }">
          <PvDefaultEntityTableActions
            :entity="term"
            label="label"
            :form="StorageLocationForm"
            :form-props="{ parents: locations }"
            :update="updateLocation"
            :remove="removeLocation"
            class="invisible group-hover:visible group-focus:visible"
          />
        </template>
        <template #footer>
          <span class="italic">{{ pluralize(locationList?.total, `location`, `locations`) }}</span>
        </template>
      </PvEntityTable>
    </section>
  </div>
</template>

<script setup lang="ts">
import { type Unit } from 'types/vocabularies/geochronology'
import { type Classification, type StorageLocation } from 'types/vocabularies'
import { type EntityJSONBody } from 'layers/base/types/entity'
import { GeochronologyForm, TaxonomyTermForm, StorageLocationForm } from '#components'

definePageMeta({
  layout: `dashboard`,
})

const { content, close: closeModal } = useModal()

const { list: unitList, entities: units, add: addUnit, update: updateUnit, remove: removeUnit } = await fetchEntityList<Unit>(`Geochronology`)
const { list: classificationList, entities: classifications, add: addClassification, update: updateClassification, remove: removeClassification } = await fetchEntityList<Classification>(`Classification`)
const { list: locationList, entities: locations, add: addLocation, update: updateLocation, remove: removeLocation } = await fetchEntityList<StorageLocation>(`StorageLocation`)

async function onCreateUnit(unit: EntityJSONBody<Unit>) {
  await addUnit(unit)
  closeModal()
}

async function onCreateClassification(classification: EntityJSONBody<Classification>) {
  await addClassification(classification)
  closeModal()
}

async function onCreateLocation(location: EntityJSONBody<StorageLocation>) {
  await addLocation(location)
  closeModal()
}
</script>
