<template>
  <div>
    <LeafletMap
      :center="mapCenter"
      :zoom="zoom"
      :max-zoom="18"
      class="h-full"
      @drag="onDragMap"
      @zoom="onZoomMap"
    >
      <LeafletMarkerCluster>
        <LeafletMarker v-for="specimen in specimens.filter(withOrigin)" :key="specimen.self"
          :center="[specimen.origin.latitude, specimen.origin.longitude]"
          :name="specimen.name"
          :accuracy="0"
          :draggable="false"
        >
          <SpecimenMapPopup :self="specimen.self" />
        </LeafletMarker>
      </LeafletMarkerCluster>
    </LeafletMap>
    <div v-if="pending" class="absolute z-[1000] bg-base-27 text-sm text-base-97 uppercase font-semibold px-3 py-1.5 shadow-md shadow-base-27/50 rounded-md bottom-6 left-1/2 flex items-center justify-center space-x-1">
      <IconSpinner class="size-4 fill-none stroke-2 stroke-current animate-spin" />
      <span>Refreshing...</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type Specimen, Status } from '~/types/specimen'
import type { Coordinate } from '~/types/leaflet'

const props = withDefaults(defineProps<{
  specimens: Specimen[]
  center?: Coordinate
  zoom?: number
  pending?: boolean
}>(), {
  center: () => [46.65848709787655, -66.35685870803573], // New Brunswick
  zoom: 7,
  pending: () => false,
})

const withOrigin = ({ origin }: Specimen) => origin?.latitude && origin?.longitude
const mapCenter = ref<Coordinate>(props.center)

function onUpdateCenter(center: Coordinate) {
  mapCenter.value = center
}

function onDragMap(center: Coordinate, bounds: [Coordinate, Coordinate]) {
  onUpdateCenter(center)
}

function onZoomMap(level: number, center: Coordinate, bounds: [Coordinate, Coordinate]) {
  onUpdateCenter(center)
}
</script>