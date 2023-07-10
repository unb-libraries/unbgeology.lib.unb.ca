<template>
  <section class="container mx-auto my-4 flex flex-row justify-between">
    <h1 class="text-4xl">
      Specimens
    </h1>
    <button class="bg-black p-3 text-white">
      <a href="/specimens/create">New specimen</a>
    </button>
  </section>
  <section class="container mx-auto mb-16 mt-4">
    <LeafletMap
      v-if="markers.length"
      class="h-80"
      :center="[markers[0].latitude, markers[0].longitude]"
    >
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
      <PvTableColumn field="objectId">
        <template #body="{ data }">
          <a :href="`/specimens/${data.objectId}/edit`" :title="`Edit ${data.objectId}`">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="h-8 w-8 rounded-md p-1 hover:bg-gray-200"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </a>
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
