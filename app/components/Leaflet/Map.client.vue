<template>
  <div id="map" />
</template>

<script setup lang="ts">
import type { Map } from "leaflet"

type Coordinate = [number, number]

}

const props = defineProps<{
  center: Coordinate,
}>()

onMounted(async () => {
  const { map: createMap, tileLayer: setTileLayer } = await import(`leaflet`)
  const map = createMap(`map`)
  const [centerLat, centerLong] = props.center
  map.setView([centerLat, centerLong], 6)
  setTileLayer(`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png`, {
    attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>`,
  }).addTo(map)

})
</script>
