<template>
  <div class="space-y-24">
    <section>
      <h2 class="mb-6 text-2xl">
        Geochronology
      </h2>
      <PvEntityTable :entities="units" :columns="[`label`, `division`, [`actions`, ``]]">
        <template #division="{ value: division }">
          {{ division.substring(0, 1).toUpperCase() + division.substring(1).toLowerCase() }}
        </template>
        <template #actions="{ entity: term }">
          <PvDefaultEntityTableActions :entity="term" :form="GeochronologyForm" :update="updateUnit" :remove="removeUnit" class="invisible group-hover:visible" />
        </template>
      </PvEntityTable>
    </section>

    <section>
      <h2 class="mb-6 text-2xl">
        Classifications
      </h2>
      <PvEntityTable :entities="classifications" :columns="[`label`, [`actions`, ``]]">
        <template #actions="{ entity: term }">
          <PvDefaultEntityTableActions
            :entity="term"
            :form="TaxonomyTermForm"
            :form-props="{ parents: classifications }"
            :update="updateClassification"
            :remove="removeClassification"
            class="invisible group-hover:visible"
          />
        </template>
      </PvEntityTable>
    </section>

    <section>
      <h2 class="mb-6 text-2xl">
        Storage locations
      </h2>
      <PvEntityTable :entities="locations" :columns="[`label`, [`actions`, ``]]">
        <template #actions="{ entity: term }">
          <PvDefaultEntityTableActions
            :entity="term"
            :form="StorageLocationForm"
            :form-props="{ parents: locations }"
            :update="updateLocation"
            :remove="removeLocation"
            class="invisible group-hover:visible"
          />
        </template>
      </PvEntityTable>
    </section>
  </div>
</template>

<script setup lang="ts">
import { type Unit } from 'types/vocabularies/geochronology'
import { type Classification, type StorageLocation } from 'types/vocabularies'
import { GeochronologyForm, TaxonomyTermForm, StorageLocationForm } from '#components'

definePageMeta({
  layout: `dashboard`,
})

const { entities: units, update: updateUnit, remove: removeUnit } = await fetchEntityList<Unit>(`Geochronology`)
const { entities: classifications, update: updateClassification, remove: removeClassification } = await fetchEntityList<Classification>(`Classification`)
const { entities: locations, update: updateLocation, remove: removeLocation } = await fetchEntityList<StorageLocation>(`StorageLocation`)
</script>
