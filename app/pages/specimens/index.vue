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
        :key="marker.self"
        :name="marker.name"
        :center="[marker.latitude, marker.longitude]"
        :accuracy="marker.accuracy"
      />
    </LeafletMap>
    <PvTable v-if="data?.items && data.items.length" :value="data.items">
      <PvTableColumn field="name" header="Name">
        <template #body="slotProps">
          <NuxtLink class="text-blue-900 hover:underline" :to="`/specimens/${slotProps.data.slug}`">
            {{ slotProps.data.name }}
          </NuxtLink>
        </template>
      </PvTableColumn>
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
          <div class="flex flex-row">
            <a :href="`/specimens/${data.slug}/edit`" :title="`Edit ${data.name}`">
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
            <a :title="`Delete ${data.name}`" @click.prevent="onDelete(data.self)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-8 w-8 rounded-md p-1 hover:cursor-pointer hover:bg-gray-200"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </a>
          </div>
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

const { data, refresh } = await useFetch<{ items: Specimen[] }>(`/api/specimens`)
const markers = computed(() => (data.value?.items ?? [])
  .filter(specimen => specimen.origin !== undefined)
  .map(specimen => ({
    self: specimen.self,
    name: specimen.name,
    latitude: specimen.origin!.latitude,
    longitude: specimen.origin!.longitude,
    accuracy: specimen.origin!.accuracy,
  })))

const onDelete = async function (uri: string) {
  // FIX: https://github.com/nuxt/nuxt/issues/19077
  await useFetch<void, Error, string, `delete`>(uri, { method: `DELETE` })
  refresh()
}
</script>
