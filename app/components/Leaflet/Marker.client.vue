<!-- eslint-disable -->
<template>
  <!-- Marker rendering by Leaflet. -->
</template>
<!-- esline-enable -->

<script setup lang="ts">
import type { Coordinate, MapInjection } from '~/types/leaflet'

const props = defineProps<{
  center: Coordinate
  name?: string
  accuracy?: number
}>()

const onMapReady = inject(`onMapReady`) as MapInjection
onMapReady((map, { marker: createMarker, circle: createCircle }) => {
  const marker = createMarker([props.center[0], props.center[1]]).addTo(map)
  if (props.name) {
    marker.bindPopup(props.name)
  }

  if (props.accuracy) {
    createCircle([props.center[0], props.center[1]], {
      color: `red`,
      opacity: 0.3,
      fillColor: `red`,
      fillOpacity: 0.3,
      radius: props.accuracy,
    }).addTo(map)
  }
})
</script>
