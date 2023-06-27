<!-- eslint-disable -->
<template>
  <!-- Marker rendering by Leaflet. -->
</template>
<!-- esline-enable -->

<script setup lang="ts">
import type { Coordinate, MapInjection } from '~/types/leaflet'

const props = withDefaults(defineProps<{
  center: Coordinate
  name?: string
  accuracy?: number
  draggable?: boolean
}>(), {
  name: ``,
  accuracy: 0,
  draggable: false,
})

const emit = defineEmits<{
  dragged: [coord: Coordinate],
}>()

const onMapReady = inject(`onMapReady`) as MapInjection
onMapReady((map, { marker: createMarker, circle: createCircle }) => {
  const marker = createMarker(props.center, {
    draggable: props.draggable,
    autoPan: true,
  })

  if (props.draggable) {
    marker.on(`moveend`, (e) => {
      const { lat, lng } = e.target.getLatLng()
      emit(`dragged`, [lat, lng])
    })
  }

  if (props.name) {
    marker.bindPopup(props.name)
  }

  marker.addTo(map)

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
