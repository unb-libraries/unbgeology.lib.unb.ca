<template>
  <div class="relative z-0 h-[calc(100dvh-15.5rem-2px)]">
    <LeafletMap :center="mapCenter" :zoom="7" :max-zoom="18" class="h-full" @drag="onDragMap" @zoom="onZoomMap">
      <LeafletMarkerCluster>
        <LeafletMarker v-for="{ id, self, type, name, classification, images, origin: { name: originName, latitude, longitude } } in specimens.filter(withOrigin)" :key="self"
          :center="[latitude, longitude]"
          :name="name"
          :accuracy="0"
          :draggable="false"
          >
          <div class="inline-flex gap-2">
            <div class="h-20 aspect-square bg-primary-40 dark:bg-primary-20 flex justify-center items-center">
              <img v-if="images?.total > 0" :src="`${images?.entities[0].uri}?w=100&h=100`" class="aspect-square object-cover">
              <IconFossil v-else-if="type === 'fossil'" class="size-16 stroke-base dark:stroke-primary-40 fill-none" />
              <IconRock v-else-if="type === 'rock'" class="size-16 stroke-base dark:stroke-primary-40 fill-none" />
              <IconMineral v-else-if="type === 'mineral'" class="size-16 stroke-base dark:stroke-primary-40 fill-none" />
            </div>
            <div class="flex flex-col">
              <a :href="`/specimens/${id}`" class="hover:underline text-lg">{{ name ?? 'Unknown' }}</a>
              <span>{{ type[0].toUpperCase() + type.slice(1).toLowerCase() }}</span>
              <span>{{ classification.label }}</span>
              <span>{{ originName }}</span>
            </div>
          </div>
        </LeafletMarker>
      </LeafletMarkerCluster>
    </LeafletMap>
    <div v-if="pending" class="absolute z-[1000] bg-base dark:bg-primary-60 text-sm px-3 py-1.5 shadow-md shadow-primary/50 rounded-md bottom-6 left-1/2 flex items-center justify-center space-x-1">
      <IconSpinner class="size-4 fill-none stroke-2 stroke-current animate-spin" />
      <span>Refreshing...</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type Specimen } from '~/types/specimen'
import type { Coordinate } from '~/types/leaflet'

defineProps<{
  specimens: Specimen[]
  pending?: boolean
}>()

const withOrigin = ({ origin }: Specimen) => origin?.latitude && origin?.longitude
const mapCenter = ref<Coordinate>([46.65848709787655, -66.35685870803573]) // Initially center on NB

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