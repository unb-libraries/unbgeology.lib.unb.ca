<template>
  <div id="map">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { Map } from "leaflet"
import type { Coordinate, Callback } from "~/types/leaflet"

const props = defineProps<{
  center: Coordinate,
}>()

const emit = defineEmits<{
  click: [coord: Coordinate]
}>()

const callbacks: Callback[] = []
const onMapReady = function (callback: Callback) {
  callbacks.push(callback)
}

let map: Map
provide(`onMapReady`, onMapReady)

onUpdated(async () => {
  const L = await import(`leaflet`)
  const [centerLat, centerLong] = props.center

  map = map || L.map(`map`)
  map.setView([centerLat, centerLong], map.getZoom() || 6)
  while (callbacks.length > 0) {
    const callback = callbacks.pop()!
    callback(map, L)
  }
})

onMapReady((map, { tileLayer: setTileLayer, Icon }) => {
  map.on(`click`, (e) => {
    const { lat, lng } = e.latlng
    emit(`click`, [lat, lng])
  })

  setTileLayer(`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png`, {
    attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>`,
  }).addTo(map)

  // REFACTOR: Map to original leaflet path, don't copy images to public.
  Icon.Default.prototype.options.iconUrl = `/images/leaflet/marker-icon.png`
  Icon.Default.prototype.options.shadowUrl = `/images/leaflet/marker-shadow.png`
})
</script>
