<script setup lang="ts">
// REFACTOR: Replace this with component from @vue-leaflet/vue-leaflet
import { Marker, Circle, Icon } from "leaflet"
import type { Coordinate, LayerAddInjection, LayerRemoveInjection } from '~/types/leaflet'

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

  if (props.name) {
    marker.bindPopup(props.name)
  }

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

  add(marker)
})

onUpdated(() => {
  if (marker) {
    marker.setLatLng(props.center)
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
