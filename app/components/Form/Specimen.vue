<template>
  <form @submit.prevent="onSubmit">
    <div class="flex flex-col md:flex-row">
      <div class="mr-4 grow">
        <div class="flex flex-col">
          <label class="mb-2 text-lg font-bold" for="name">Name</label>
          <PvInputText v-model="name" name="name" />
        </div>
        <div class="my-6 flex flex-col">
          <label class="mb-2 text-lg font-bold" for="date">Date</label>
          <PvInputMask v-model="date" name="date" mask="9999?/99/99" placeholder="YYYY/MM/DD" />
        </div>
        <div class="my-6 flex flex-row">
          <div class="mr-3 flex w-1/2 flex-col">
            <label class="mb-2 text-lg font-bold" for="age">Age</label>
            <PvInputSelect v-model="age" name="age" :options="['Cretaceous', 'Eocene', 'Ordovician', 'Holocene', 'Precambrian']" />
          </div>
          <div class="ml-3 flex w-1/2 flex-col">
            <label class="mb-2 text-lg font-bold" for="composition">Composition</label>
            <PvInputSelect v-model="composition" name="composition" :options="['solid']" />
          </div>
        </div>
        <div class="my-6 flex flex-row">
          <div class="mr-3 flex w-1/2 flex-col">
            <label class="mb-2 text-lg font-bold" for="width">Width</label>
            <PvInputNumber v-model="width" name="width" />
          </div>
          <div class="ml-3 flex w-1/2 flex-col">
            <label class="mb-2 text-lg font-bold" for="length">Length</label>
            <PvInputNumber v-model="length" name="length" />
          </div>
        </div>
        <div class="mt-6 flex flex-row">
          <div class="mr-3 flex w-1/2 flex-col">
            <label class="mb-2 text-lg font-bold" for="pieces">Pieces</label>
            <PvInputNumber v-model="pieces" name="pieces" />
          </div>
          <div class="ml-3 flex w-1/2 flex-col">
            <label class="mb-2 text-lg font-bold">Partial</label>
            <div name="partial" class="flex h-full flex-row items-center">
              <div class="mr-6">
                <input
                  id="partial-yes"
                  v-model="partial"
                  type="radio"
                  name="partial"
                  value="true"
                  class="dark:bg-primary border-primary-20 dark:border-primary-60/75 hover:border-accent-light checked:border-accent-mid focus:ring-accent-light/50 focus:ring-offset-base dark:focus:ring-offset-primary h-6 w-6 cursor-pointer appearance-none rounded-full border bg-white align-middle checked:border-8 focus:ring-2 focus:ring-offset-2"
                >
                <label class="mx-3 align-middle" for="partial-yes">Yes</label>
              </div>
              <div>
                <input
                  id="partial-no"
                  v-model="partial"
                  type="radio"
                  name="partial"
                  value="false"
                  class="dark:bg-primary border-primary-20 dark:border-primary-60/75 hover:border-accent-light checked:border-accent-mid focus:ring-accent-light/50 focus:ring-offset-base dark:focus:ring-offset-primary h-6 w-6 cursor-pointer appearance-none rounded-full border bg-white align-middle checked:border-8 focus:ring-2 focus:ring-offset-2"
                >
                <label class="mx-3 align-middle" for="partial-no">No</label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="w-full md:ml-4 md:w-1/2">
        <div class="flex h-full w-full flex-col">
          <label class="mb-2 text-lg font-bold" for="origin">Origin</label>
          <LeafletMap class="h-full rounded-md" name="origin" :center="[latitude || 0, longitude || 0]" @click="onMapClick">
            <LeafletSearch @item-select="onSearchItemSelect" />
            <LeafletMarker
              v-if="latitude !== undefined && longitude !== undefined"
              :name="name"
              :center="[latitude, longitude]"
              :draggable="true"
              @dragged="onMarkerDragged"
            />
          </LeafletMap>
        </div>
      </div>
    </div>
    <div class="mt-8 flex flex-row">
      <button type="submit" class="bg-accent-dark dark:bg-accent-mid hover:bg-accent-light mr-2 rounded-md p-3 font-bold text-white">
        Save
      </button>
      <NuxtLink to="/" class="font-base ml-2 p-3">
        Cancel
      </NuxtLink>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { Specimen } from 'entity-types/Specimen'
import type { Coordinate } from '~/types/leaflet'
import type { Location } from '~/types/nominatim'

const props = defineProps<{
  specimen?: Specimen,
}>()

const emit = defineEmits<{
  created: [specimen: Partial<Specimen>],
  updated: [specimen: Partial<Specimen>],
}>()

const name = ref(props.specimen?.name)
const pieces = ref(props.specimen?.pieces)
const age = ref(props.specimen?.age)
const width = ref(props.specimen?.dimensions?.width)
const length = ref(props.specimen?.dimensions?.length)
const composition = ref(props.specimen?.composition)
const date = ref(props.specimen?.date)
const partial = ref(`${props.specimen?.partial}`)

const latitude = ref(props.specimen?.origin?.latitude)
const longitude = ref(props.specimen?.origin?.longitude)

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
  const body: Partial<Specimen> = {
    name: name.value,
    pieces: pieces.value,
    age: age.value,
    composition: composition.value,
    date: date.value,
  }

  if (latitude.value && longitude.value) {
    body.origin = {
      latitude: latitude.value,
      longitude: longitude.value,
      accuracy: 0,
    }
  }

  if (width.value && length.value) {
    body.dimensions = {
      width: width.value,
      length: length.value,
    }
  }

  if (partial.value) {
    body.partial = partial.value === `true`
  }

  const create = async function (specimen: Partial<Specimen>) {
    const { data, error } = await useFetch<Partial<Specimen>>(`/api/specimens`, {
      method: `POST`,
      body: specimen,
    })

    if (!error.value) {
      emit(`created`, data.value!)
    } else {
      console.log(error.value.message)
    }
  }

  const update = async function (specimen: Partial<Specimen>) {
    const { data, error } = await useFetch<Partial<Specimen>>(`/api/specimens/${props.specimen!.slug}`, {
      method: `PUT`,
      body: specimen,
    })

    if (!error.value) {
      emit(`updated`, data.value!)
    } else {
      console.log(error.value.message)
    }
  }

  if (!props.specimen) {
    create(body)
  } else {
    update(body)
  }
}
</script>
