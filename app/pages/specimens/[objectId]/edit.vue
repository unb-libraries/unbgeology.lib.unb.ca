<template>
  <section v-if="specimen" class="container mx-auto my-4">
    <h1 class="text-4xl">
      {{ specimen.name }}
    </h1>
  </section>
  <section v-if="specimen" class="container mx-auto my-4">
    <form @submit.prevent="onSubmit">
      <div>
        <LeafletMap class="h-80" :center="[latitude || 0, longitude || 0]" @click="onMapClick">
          <LeafletSearch @item-select="onSearchItemSelect" />
          <LeafletMarker
            v-if="latitude !== undefined && longitude !== undefined"
            :name="specimen.name"
            :center="[latitude, longitude]"
            :draggable="true"
            @dragged="onMarkerDragged"
          />
        </LeafletMap>
      </div>
      <div class="my-8 flex flex-col">
        <label class="mb-2 text-lg font-bold" for="name">Name</label>
        <PvInputText v-model="name" name="name" />
      </div>
      <div class="my-8 flex flex-col">
        <label class="mb-2 text-lg font-bold" for="date">Date</label>
        <PvInputMask v-model="date" name="date" mask="9999?/99/99" placeholder="YYYY/MM/DD" />
      </div>
      <div class="my-8 flex flex-col">
        <label class="mb-2 text-lg font-bold" for="age">Age</label>
        <PvInputSelect v-model="age" name="age" :options="['very hold', 'fairly young']" />
      </div>
      <div class="my-8 flex flex-col">
        <label class="mb-2 text-lg font-bold" for="composition">Composition</label>
        <PvInputSelect v-model="composition" name="composition" :options="['Solid', 'Rather fuzzy']" />
      </div>
      <div class="my-8 flex flex-col">
        <label class="mb-2 text-lg font-bold" for="width">Width</label>
        <PvInputNumber v-model="width" name="width" />
      </div>
      <div class="my-8 flex flex-col">
        <label class="mb-2 text-lg font-bold" for="length">Length</label>
        <PvInputNumber v-model="length" name="length" />
      </div>
      <div class="my-8 flex flex-col">
        <label class="mb-2 text-lg font-bold" for="pieces">Pieces</label>
        <PvInputNumber v-model="pieces" name="pieces" />
      </div>
      <div class="my-8 flex flex-col">
        <label class="mb-2 text-lg font-bold">Partial</label>
        <div name="partial" class="flex flex-row">
          <div class="mr-6">
            <PvInputRadio v-model="partial" name="partial-yes" value="true" />
            <label class="mx-3" for="partial-yes">Yes</label>
          </div>
          <div>
            <PvInputRadio v-model="partial" name="partial-no" value="false" />
            <label class="mx-3" for="partial-no">No</label>
          </div>
        </div>
      </div>
      <div class="my-8">
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
import type { Location } from '~/types/nominatim'

const objectId = useRoute().params.objectId
const { data: specimen, error } = await useFetch<Specimen>(`/api/specimens/${objectId}`)
if (error.value) {
  showError({ statusCode: 404 })
}

const name = ref(specimen.value?.name)
const pieces = ref(specimen.value?.pieces)
const age = ref(specimen.value?.age)
const width = ref(specimen.value?.dimensions?.width)
const length = ref(specimen.value?.dimensions?.length)
const composition = ref(specimen.value?.composition)
const date = ref(specimen.value?.date)
const partial = ref(`${specimen.value?.partial}`)

const latitude = ref(specimen.value?.origin?.latitude)
const longitude = ref(specimen.value?.origin?.longitude)

const onMarkerDragged = function (coord: Coordinate) {
  const [newLat, newLong] = coord
  latitude.value = newLat
  longitude.value = newLong
}

const onSearchItemSelect = function (item: Location) {
  const { lat, lon } = item
  latitude.value = lat
  longitude.value = lon
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
      name,
      pieces,
      age,
      dimensions: {
        width,
        length,
      },
      composition,
      date,
      partial: partial.value === `true`,
    },
  })

  if (!error.value) {
    navigateTo(`/specimens/${objectId}`)
  } else {
    console.log(error.value.message)
  }
}
</script>
