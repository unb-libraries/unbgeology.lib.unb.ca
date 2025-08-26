<template>
  <div id="map">
    <slot />
  </div>
</template>

<script setup lang="ts">
// REFACTOR: Replace this with component from @vue-leaflet/vue-leaflet
import { Map, tileLayer as setTileLayer } from "leaflet"
import type { Layer } from "leaflet"
import type { Coordinate } from "~/types/leaflet"

const leafletCSS = new URL('leaflet/dist/leaflet.css', import.meta.url).href
const markerClusterCSS = new URL('leaflet.markercluster/dist/MarkerCluster.css', import.meta.url).href
const markerClusterDefaultCSS = new URL('leaflet.markercluster/dist/MarkerCluster.Default.css', import.meta.url).href

useHead({
  link: [
    { rel: 'stylesheet', href: leafletCSS },
    { rel: 'stylesheet', href: markerClusterCSS },
    { rel: 'stylesheet', href: markerClusterDefaultCSS },
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

let map: Map
const callbacks: ((map: Map) => void)[] = []

async function getMap() {
  return new Promise<Map>((resolve) => {
    if (map) {
      resolve(map)
    } else {
      callbacks.push(resolve)
    }
  })
}

provide(`map`, getMap)
provide(`add`, async (layer: Layer) => { (await getMap()).addLayer(layer) })
provide(`remove`, async (layer: Layer) => { (await getMap()).removeLayer(layer) })

function initMap() {
  map = new Map(`map`, {
    maxZoom: props.maxZoom,
    minZoom: props.minZoom,
  })

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

  while (callbacks.pop()?.(map)) { }
  emit(`ready`, map)
}

onUpdated(async () => {
  if (!map) {
    initMap()
  }
  const [centerLat, centerLong] = props.center
  map.setView([centerLat, centerLong], map.getZoom() ?? props.zoom ?? 6)
})
</script>
