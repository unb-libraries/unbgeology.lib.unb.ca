<template>
  <div id="map">
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { Coordinate, Callback } from "~/types/leaflet"

const props = defineProps<{
  center: Coordinate,
}>()

const callbacks: Callback[] = []
const onMapReady = function (callback: Callback) {
  callbacks.push(callback)
}
provide(`onMapReady`, onMapReady)

onMounted(async () => {
  const Leaflet = await import(`leaflet`)
  const map = Leaflet.map(`map`)
  callbacks.forEach((callback) => {
    callback(map, Leaflet)
  })
})

onMapReady((map, { tileLayer: setTileLayer }) => {
  const [centerLat, centerLong] = props.center
  map.setView([centerLat, centerLong], 6)
  setTileLayer(`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png`, {
    attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>`,
  }).addTo(map)
})
</script>
