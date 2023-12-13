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
          <span v-if="unitList?.total" class="italic">{{ pluralize(unitList?.total, `unit`, `units`) }}</span>
        </template>
      </PvEntityTable>
    </section>

    <section>
      <header class="flex flex-row justify-between">
        <h2 class="mb-6 text-2xl">
          Rock
        </h2>
        <div class="space-x-1">
          <button class="form-action form-action-submit p-2 font-normal" @click.prevent="content = { component: TaxonomyTermForm, props: { entity: {}, parents: rocks }, eventHandlers: { save: onCreateRock, cancel: () => closeModal()}}">
            Create
          </button>
        </div>
      </header>
      <PvEntityTable :entities="rocks" :columns="[`label`, [`actions`, ``]]">
        <template #actions="{ entity: term }">
          <PvDefaultEntityTableActions
            :entity="term"
            label="label"
            :form="TaxonomyTermForm"
            :form-props="{ parents: rocks }"
            :update="updateRock"
            :remove="removeRock"
            class="invisible group-hover:visible group-focus:visible"
          />
        </template>
        <template #footer>
          <span v-if="rockList?.total" class="italic">{{ pluralize(rockList?.total, `term`, `terms`) }}</span>
        </template>
      </PvEntityTable>
    </section>

    <section>
      <header class="flex flex-row justify-between">
        <h2 class="mb-6 text-2xl">
          Mineral
        </h2>
        <div class="space-x-1">
          <button class="form-action form-action-submit p-2 font-normal" @click.prevent="content = { component: TaxonomyTermForm, props: { entity: {}, parents: minerals }, eventHandlers: { save: onCreateMineral, cancel: () => closeModal()}}">
            Create
          </button>
        </div>
      </header>
      <PvEntityTable :entities="minerals" :columns="[`label`, [`actions`, ``]]">
        <template #actions="{ entity: term }">
          <PvDefaultEntityTableActions
            :entity="term"
            label="label"
            :form="TaxonomyTermForm"
            :form-props="{ parents: minerals }"
            :update="updateMineral"
            :remove="removeMineral"
            class="invisible group-hover:visible group-focus:visible"
          />
        </template>
        <template #footer>
          <span v-if="mineralList?.total" class="italic">{{ pluralize(mineralList?.total, `term`, `terms`) }}</span>
        </template>
      </PvEntityTable>
    </section>

    <section>
      <header class="flex flex-row justify-between">
        <h2 class="mb-6 text-2xl">
          Fossil
        </h2>
        <div class="space-x-1">
          <button class="form-action form-action-submit p-2 font-normal" @click.prevent="content = { component: TaxonomyTermForm, props: { entity: {}, parents: minerals }, eventHandlers: { save: onCreateFossil, cancel: () => closeModal()}}">
            Create
          </button>
        </div>
      </header>
      <PvEntityTable :entities="fossils" :columns="[`label`, [`actions`, ``]]">
        <template #actions="{ entity: term }">
          <PvDefaultEntityTableActions
            :entity="term"
            label="label"
            :form="TaxonomyTermForm"
            :form-props="{ parents: fossils }"
            :update="updateFossil"
            :remove="removeFossil"
            class="invisible group-hover:visible group-focus:visible"
          />
        </template>
        <template #footer>
          <span v-if="fossilList?.total" class="italic">{{ pluralize(fossilList?.total, `term`, `terms`) }}</span>
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
          <span v-if="locationList?.total" class="italic">{{ pluralize(locationList?.total, `location`, `locations`) }}</span>
        </template>
      </PvEntityTable>
    </section>
  </div>
</template>

<script setup lang="ts">
import { type Unit } from 'types/vocabularies/geochronology'
import { type StorageLocation } from 'types/vocabularies'
import { type Rock, type Mineral, type Fossil } from 'types/vocabularies/classification'
import { type EntityJSONBody } from 'layers/base/types/entity'
import { GeochronologyForm, TaxonomyTermForm, StorageLocationForm } from '#components'

definePageMeta({
  layout: `dashboard`,
})

const { content, close: closeModal } = useModal()

const { list: unitList, entities: units, add: addUnit, update: updateUnit, remove: removeUnit } = await fetchEntityList<Unit>(`Geochronology`)
const { list: locationList, entities: locations, add: addLocation, update: updateLocation, remove: removeLocation } = await fetchEntityList<StorageLocation>(`StorageLocation`)

async function onCreateUnit(unit: EntityJSONBody<Unit>) {
  await addUnit(unit)
  closeModal()
}

const { list: rockList, entities: rocks, add: addRock, update: updateRock, remove: removeRock } = await fetchEntityList<Rock>(`Rock`)
async function onCreateRock(rock: EntityJSONBody<Rock>) {
  await addRock(rock)
  closeModal()
}

const { list: mineralList, entities: minerals, add: addMineral, update: updateMineral, remove: removeMineral } = await fetchEntityList<Mineral>(`Mineral`)
async function onCreateMineral(mineral: EntityJSONBody<Mineral>) {
  await addMineral(mineral)
  closeModal()
}

const { list: fossilList, entities: fossils, add: addFossil, update: updateFossil, remove: removeFossil } = await fetchEntityList<Fossil>(`Fossil`)
async function onCreateFossil(fossil: EntityJSONBody<Fossil>) {
  await addFossil(fossil)
  closeModal()
}

async function onCreateLocation(location: EntityJSONBody<StorageLocation>) {
  await addLocation(location)
  closeModal()
}
</script>
