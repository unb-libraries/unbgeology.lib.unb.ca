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
          <slot>
            <div class="inline-flex gap-2 w-full p-4">
              <SpecimenImage :category="specimen.type" :url="specimen.images?.entities?.[0]?.uri" width="100" height="100" class="aspect-square h-24 flex-none" />
              <div class="flex flex-col gap-y-2 w-full">
                <h2 class="flex items-center gap-x-2">
                  <a :href="`/specimens/${specimen.id}`" :title="specimen.name ?? 'Unknown'" class="text-xl !text-base-27 dark:!text-base-67 hover:!text-accent-26 dark:hover:!text-accent-36 leading-none truncate overflow-hidden border-b border-current">{{ specimen.name ?? 'Unknown' }}</a>
                  <IconLock v-if="useEnum(Status).valueOf(specimen.status) !== Status.PUBLISHED" title="Unpublished" class="flex-none text-red dark:text-red-light stroke-2 size-4" />
                  <SpecimenEditLink :specimen="specimen" class="flex-none !text-base-27 dark:!text-base-67" />
                </h2>
                <div class="inline-flex gap-x-1 leading-none items-start text-sm font-semibold uppercase">
                  <SpecimenIcon :category="specimen.type" class="size-4 flex-none" />
                  <span class="sr-only">Classification</span>
                  <span class="text-nowrap">
                    {{ [specimen.type[0].toUpperCase() + specimen.type.slice(1).toLowerCase(), specimen.classification?.label].filter(Boolean).join(' / ') }}
                  </span>
                </div>
                <div v-if="specimen.origin?.name" class="inline-flex gap-x-1 leading-none items-start text-sm font-semibold uppercase">
                  <IconMapPin class="size-4 fill-none stroke-current stroke-2 flex-none" />
                  <span class="sr-only">Origin</span>
                  <span class="text-nowrap">{{ specimen.origin?.name }}</span>
                </div>
              </div>
            </div>
          </slot>
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

<style>
.leaflet-popup-content {
  @apply bg-base-87 dark:bg-base-2 text-base-17 dark:text-base-87 m-0 !w-fit;
}

.leaflet-popup-content-wrapper {
  @apply bg-base-87 dark:bg-base-2 rounded-none;
}

.leaflet-popup-tip {
  @apply bg-base-87 dark:bg-base-2;
}

.leaflet-popup-close-button {
  @apply hidden;
}
</style>