<template>
  <div id="map" ref="mapContainer">
    <slot />
  </div>
</template>

<script setup lang="ts">
// REFACTOR: Replace this with component from @vue-leaflet/vue-leaflet
import { Map, tileLayer } from "leaflet"
import type { Layer } from "leaflet"
import { GestureHandling } from 'leaflet-gesture-handling'
import type { Coordinate } from "~/types/leaflet"

const mapContainer = ref<HTMLDivElement>()
const map = ref<Map>()

const leafletCSS = new URL('leaflet/dist/leaflet.css', import.meta.url).href
const markerClusterCSS = new URL('leaflet.markercluster/dist/MarkerCluster.css', import.meta.url).href
const markerClusterDefaultCSS = new URL('leaflet.markercluster/dist/MarkerCluster.Default.css', import.meta.url).href
const gestureHandlingCSS = new URL('leaflet-gesture-handling/dist/leaflet-gesture-handling.css', import.meta.url).href

useHead({
  link: [
    { rel: 'stylesheet', href: leafletCSS },
    { rel: 'stylesheet', href: markerClusterCSS },
    { rel: 'stylesheet', href: markerClusterDefaultCSS },
    { rel: 'stylesheet', href: gestureHandlingCSS },
  ],
})

const props = withDefaults(defineProps<{
  center: Coordinate,
  zoom?: number
  maxZoom?: number
  minZoom?: number
}>(), {
  zoom: 8,
  maxZoom: 24,
  minZoom: 3,
})

const emit = defineEmits<{
  ready: [map: Map]
  click: [coord: Coordinate]
  drag: [center: Coordinate, bounds: [Coordinate, Coordinate]]
  zoom: [level: number, Coordinate, bounds: [Coordinate, Coordinate]]
}>()

async function getMap() {
  return new Promise<Map>((resolve) => {
    if (map.value) {
      resolve(map.value)
    } else {
      watch(map, (map) => {
        resolve(map!)
      }, { once: true })
    }
  })
}

provide(`map`, getMap)
provide(`add`, async (layer: Layer) => (await getMap()).addLayer(layer))
provide(`remove`, async (layer: Layer) => (await getMap()).removeLayer(layer))

function createMap(container: HTMLDivElement) {
  const map = new Map(container, {
    center: props.center,
    zoom: props.zoom,
    maxZoom: props.maxZoom,
    minZoom: props.minZoom,
    maxBounds: [[ -90, -180 ], [ 90, 180 ]],
    maxBoundsViscosity: 1.0,
    gestureHandling: true,
  })

  map.addHandler('gestureHandling', GestureHandling)

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
  
  const tiles = tileLayer(`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png`, {
    attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>`,
  })
  map.addLayer(tiles)

  return map
}

onMounted(async () => {
  function setMap(container?: HTMLDivElement) {
    if (!container) {
      return
    }
    const m = createMap(container)
    map.value = m
    emit(`ready`, m)
  }
  
  if (!mapContainer.value) {
    watch(mapContainer, setMap, { once: true })
  } else {
    setMap(mapContainer.value)
  }
})

onUpdated(async () => {
  const map = await getMap()
  const [centerLat, centerLong] = props.center
  map.setView([centerLat, centerLong], map.getZoom() ?? props.zoom ?? 6)
})
</script>
