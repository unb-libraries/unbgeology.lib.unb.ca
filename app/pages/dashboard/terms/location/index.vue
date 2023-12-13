<template>
  <div class="space-y-24">
    <section>
      <header class="flex flex-row justify-between">
        <h2 class="mb-6 text-2xl">
          Locations
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
import { type StorageLocation } from 'types/vocabularies'
import { type EntityJSONBody } from 'layers/base/types/entity'
import { StorageLocationForm } from '#components'

definePageMeta({
  layout: `dashboard`,
})

const { content, close: closeModal } = useModal()

const { list: locationList, entities: locations, add: addLocation, update: updateLocation, remove: removeLocation } = await fetchEntityList<StorageLocation>(`StorageLocation`)
async function onCreateLocation(location: EntityJSONBody<StorageLocation>) {
  await addLocation(location)
  closeModal()
}
</script>
