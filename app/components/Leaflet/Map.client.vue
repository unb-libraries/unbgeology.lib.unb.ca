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
  zoom?: number
}>()

const emit = defineEmits<{
  ready: [map: Map]
  click: [coord: Coordinate]
  drag: [center: Coordinate, bounds: [Coordinate, Coordinate]]
  zoom: [level: number, Coordinate, bounds: [Coordinate, Coordinate]]
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
  map.setView([centerLat, centerLong], map.getZoom() ?? props.zoom ?? 6)

  while (callbacks.length > 0) {
    const callback = callbacks.pop()!
    callback(map, L)
  }
})

onMapReady((map, { tileLayer: setTileLayer }) => {
  console.log(`onMapReady`)

  map.on(`click`, (e) => {
    const { lat, lng } = e.latlng
    emit(`click`, [lat, lng])
  })

  map.on(`dragend`, (e) => {
    const bounds = map.getBounds()
    const center = map.getCenter()
    const [northEast, southWest] = [bounds.getNorthEast(), bounds.getSouthWest()]
    emit(`drag`, [center.lat, center.lng], [
      [northEast.lat, northEast.lng],
      [southWest.lat, southWest.lng],
    ])
  })

  map.on(`zoomend`, () => {
    const bounds = map.getBounds()
    const center = map.getCenter()
    const [northEast, southWest] = [bounds.getNorthEast(), bounds.getSouthWest()]
    emit(`zoom`, map.getZoom(), [center.lat, center.lng], [
      [northEast.lat, northEast.lng],
      [southWest.lat, southWest.lng],
    ])
  })

  setTileLayer(`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png`, {
    attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>`,
  }).addTo(map)

  emit(`ready`, map)
})
</script>
