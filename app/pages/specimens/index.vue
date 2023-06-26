<template>
  <section class="container mx-auto my-4">
    <h1 class="text-4xl">
      Specimens
    </h1>
  </section>
  <section class="container mx-auto">
    <LeafletMap v-if="markers.length" class="h-80" :center="[markers[0].latitude, markers[0].longitude]">
      <LeafletMarker
        v-for="marker in markers"
        :key="marker.id"
        :name="marker.name"
        :center="[marker.latitude, marker.longitude]"
        :accuracy="marker.accuracy"
      />
    </LeafletMap>
    <PvTable v-if="specimens && specimens.length" :value="specimens">
      <PvTableColumn field="objectId" header="ID">
        <template #body="slotProps">
          <NuxtLink class="text-blue-900 hover:underline" :to="`/specimens/${slotProps.data.objectId}`">
            {{ slotProps.data.objectId }}
          </NuxtLink>
        </template>
      </PvTableColumn>
      <PvTableColumn field="name" header="Name" />
      <PvTableColumn field="age" header="Age" />
      <PvTableColumn field="pieces" header="Pieces" />
      <PvTableColumn field="dimensions" header="Dimensions (W x L)">
        <template #body="slotProps">
          <span v-if="slotProps.data.dimensions">
            {{ slotProps.data.dimensions.width }}mm x {{ slotProps.data.dimensions.length }}mm
          </span>
        </template>
      </PvTableColumn>
    </PvTable>
    <div v-else>
      No specimens found.
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Specimen } from "entity-types/Specimen"

const { data: specimens } = await useFetch<Specimen[]>(`/api/specimens`)
const markers = computed(() => (specimens.value ?? [])
  .filter(specimen => specimen.origin !== undefined)
  .map(specimen => ({
    id: specimen.objectId,
    name: specimen.name,
    latitude: specimen.origin!.latitude,
    longitude: specimen.origin!.longitude,
    accuracy: specimen.origin!.accuracy,
  })))
</script>
