<template>
  <section v-if="specimen" class="container mx-auto my-4">
    <h1 class="text-4xl">
      {{ specimen.name }}
    </h1>
  </section>
  <section v-if="specimen" class="container mx-auto">
    <form @submit.prevent="onSubmit">
      <div>
        <LeafletMap class="h-80" :center="[latitude || 0, longitude || 0]" @click="onMapClick">
          <LeafletMarker
            v-if="latitude !== undefined && longitude !== undefined"
            :name="specimen.name"
            :center="[latitude, longitude]"
            :draggable="true"
            @dragged="onMarkerDragged"
          />
        </LeafletMap>
      </div>
      <div class="mt-4">
        <button type="submit" class="bg-black p-3 text-white">
          Save
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import type { Specimen } from 'entity-types/Specimen'
import type { Coordinate } from '~/types/leaflet'

const objectId = useRoute().params.objectId
const { data: specimen, error } = await useFetch<Specimen>(`/api/specimens/${objectId}`)
if (error.value) {
  showError({ statusCode: 404 })
}

const latitude = ref(specimen.value?.origin?.latitude)
const longitude = ref(specimen.value?.origin?.longitude)

const onMarkerDragged = function (coord: Coordinate) {
  const [newLat, newLong] = coord
  latitude.value = newLat
  longitude.value = newLong
}

const onMapClick = function (coord: Coordinate) {
  const [newLat, newLong] = coord
  latitude.value = newLat
  longitude.value = newLong
}

const onSubmit = function () {
  const { error } = useFetch(`/api/specimens/${objectId}`, {
    method: `PUT`,
    body: {
      origin: {
        latitude,
        longitude,
      },
    },
  })

  if (!error.value) {
    navigateTo(`/specimens/${objectId}`)
  } else {
    console.log(error.value.message)
  }
}
</script>
