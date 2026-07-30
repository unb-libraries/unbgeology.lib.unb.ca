<template>
  <slot />
</template>

<script lang="ts" setup>
// REFACTOR: Use vue-leaflet-markercluster
import type { LayerAddInjection, LayerRemoveInjection } from '~~/types/leaflet'
import { Layer } from 'leaflet'
import "leaflet.markercluster"
import { MarkerClusterGroup } from 'leaflet'

const add = inject<LayerAddInjection>(`add`)
const remove = inject<LayerRemoveInjection>(`remove`)
if (!add || !remove) {
  throw new Error(`MarkerCluster component must be used inside a Map component`)
}

let cluster: MarkerClusterGroup

function getCluster() {
  if (!cluster) {
    cluster = new MarkerClusterGroup()
    add!(cluster)
  }
  return cluster
}

provide(`cluster`, getCluster)
provide(`add`, (layer: Layer) => { getCluster().addLayer(layer) })
provide(`remove`, (layer: Layer) => { getCluster().removeLayer(layer) })
</script>