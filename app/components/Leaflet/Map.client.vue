<template>
  <div id="map" />
</template>

<script setup lang="ts">
import type { Map } from "leaflet"

type Coordinate = [number, number]

interface Marker {
  center: Coordinate,
  name: string
  radius?: number
}

const props = defineProps<{
  center: Coordinate,
  markers: Marker[],
}>()

onMounted(async () => {
  const {
    map: createMap,
    tileLayer: setTileLayer,
    marker: createMarker,
    circle: createCircle,
  } = await import(`leaflet`)

  const map = createMap(`map`)
  const [centerLat, centerLong] = props.center
  map.setView([centerLat, centerLong], 6)
  setTileLayer(`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png`, {
    attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>`,
  }).addTo(map)

  props.markers.forEach((marker) => {
    createMarker([marker.center[0], marker.center[1]])
      .bindPopup(marker.name)
      .addTo(map)
    if (marker.radius) {
      createCircle([marker.center[0], marker.center[1]], {
        color: `red`,
        opacity: 0.3,
        fillColor: `red`,
        fillOpacity: 0.3,
        radius: 500,
      }).addTo(map)
    }
  })
})
</script>
