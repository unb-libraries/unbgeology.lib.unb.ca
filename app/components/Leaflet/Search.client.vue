<template>
  <PvAutoComplete
    id="leaflet-location-search"
    v-model="location"
    class="leaflet-control"
    input-class="dark:bg-white bg-white text-primary dark:text-primary px-2 py-1 rounded-sm"
    :suggestions="locations"
    option-label="display_name"
    @click.stop
    @complete="searchLocation"
    @item-select="$emit('itemSelect', $event.value)"
  />
</template>

<script setup lang="ts">
import type { Map } from "leaflet"
import type { MapInjection } from "~/types/leaflet"
import type { Location } from "~/types/nominatim"

defineEmits([`itemSelect`])

const location = ref(``)
const locations = ref<Location[]>([])

const searchLocation = async function (event: { query: string }) {
  const { data: results } = await useFetch(`https://nominatim.openstreetmap.org/search`, {
    query: {
      q: event.query,
      format: `json`,
    },
    transform: (results: Location[]) => results.filter(result => result.type === `administrative`),
  })

  if (results.value) {
    locations.value = results.value
  }
}

const onMapReady = inject(`onMapReady`) as MapInjection
onMapReady((map, { Control, DomUtil }) => {
  const Search = Control.extend({
    onAdd(map: Map) {
      return DomUtil.get(`leaflet-location-search`)
    },
    onRemove(map: Map) {

    },
  })

  new Search({ position: `bottomleft` })
    .addTo(map)
})
</script>
