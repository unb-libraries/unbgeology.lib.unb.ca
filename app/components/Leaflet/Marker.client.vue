<template>
  <slot v-if="popupOpened" />
</template>

<script setup lang="ts">
// REFACTOR: Replace this with component from @vue-leaflet/vue-leaflet
import { Marker, Circle, Icon } from "leaflet"
import type { Coordinate, LayerAddInjection, LayerRemoveInjection } from '~/types/leaflet'
import { renderToString } from '@vue/server-renderer'

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

const popupOpened = ref(false)
const add = inject<LayerAddInjection>(`add`)
const remove = inject<LayerRemoveInjection>(`remove`)
if (!add || !remove) {
  throw new Error(`Marker component must be used inside a Map component`)
}

let marker: Marker
let circle: Circle

onMounted(() => {
  Icon.Default.imagePath = `/leaflet/img/`

  marker = new Marker(props.center, {
    draggable: props.draggable,
    autoPan: true,
  })

  if (props.draggable) {
    marker.on(`moveend`, (e) => {
      const { lat, lng } = e.target.getLatLng()
      emit(`dragged`, [lat, lng])
    })
  }

  marker.bindPopup('')

  if (props.accuracy) {
    circle = new Circle([props.center[0], props.center[1]], {
      color: `red`,
      opacity: 0.3,
      fillColor: `red`,
      fillOpacity: 0.3,
      radius: props.accuracy,
    })
    add(circle)
  }

  marker.on('popupopen', () => popupOpened.value = true)
  
  add(marker)
})

onUpdated(async () => {
  if (marker) {
    marker.setLatLng(props.center)
    if (popupOpened.value) {
      const popupContent = await Promise.all(getCurrentInstance()?.slots.default?.()
        .map(vnode => renderToString(vnode)) ?? [])
      marker.setPopupContent(popupContent.join(''))
    }
  }
})

onUnmounted(() => {
  if (marker) {
    remove(marker)
  }
  if (circle) {
    remove(circle)
  }
})
</script>
