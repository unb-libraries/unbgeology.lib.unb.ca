<template>
  <slot />
</template>

<script lang="ts" setup>
// REFACTOR: Use vue-leaflet-markercluster
import type { LayerAddInjection, LayerRemoveInjection } from '~/types/leaflet'
import { Layer } from 'leaflet'
import "leaflet.markercluster"
import { MarkerClusterGroup } from 'leaflet'

const add = inject<LayerAddInjection>(`add`)
const remove = inject<LayerRemoveInjection>(`remove`)
if (!add || !remove) {
  throw new Error(`MarkerCluster component must be used inside a Map component`)
}

let cluster: MarkerClusterGroup
const callbacks: ((cluster: MarkerClusterGroup) => void)[] = []

async function getCluster() {
  return new Promise<MarkerClusterGroup>((resolve) => {
    if (cluster) {
      resolve(cluster)
    } else {
      callbacks.push(resolve)
    }
  })
}

provide(`cluster`, getCluster)
provide(`add`, async (layer: Layer) => { console.log('add layer'); (await getCluster()).addLayer(layer) })
provide(`remove`, async (layer: Layer) => { (await getCluster()).removeLayer(layer) })

function initCluster() {
  cluster = new MarkerClusterGroup()
  while (callbacks.pop()?.(cluster)) { }
  add!(cluster)
}

onUpdated(() => {
  if (!cluster) {
    initCluster()
  }
})
</script>