<template>
  <PvInputDropdown
    :id="`leaflet-name-search`"
    v-model="placeID"
    :options="options"
    placeholder="Search by place name"
    option-field="place_id"
    label-field="display_name"
    :input="true"
    list-class="bottom-10 bg-white dark:bg-white"
    @input="onSearch"
  >
    <template #reset>
      <PvProgressSpinner v-if="pending" class="mr-2 h-6 w-6" stroke-width="4" />
    </template>
  </PvInputDropdown>
</template>

<script setup lang="ts">
import type { Map } from "leaflet"
import type { MapInjection } from "~/types/leaflet"
import { type Location } from '~/types/nominatim'

const location = defineModel<Location>(`location`, { required: false })
const placeID = ref()
const options = ref<Record<string, Location>>({})
const pending = ref(false)

defineProps<{}>()

let timer: NodeJS.Timeout
const { resolveName } = useNominatim()
function onSearch(search: string) {
  if (search.length >= 3) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(async () => {
      pending.value = true
      const { results, error } = await resolveName(search)
      pending.value = false
      if (!error.value && results.value) {
        options.value = results.value.reduce((all, one) => ({ ...all, [one.place_id]: one }), {})
      }
    }, 500)
  }
}

watch(placeID, (id) => {
  location.value = options.value[id]
})

const onMapReady = inject(`onMapReady`) as MapInjection
onMapReady((map, { Control, DomUtil }) => {
  const Search = Control.extend({
    onAdd(map: Map) {
      return DomUtil.get(`leaflet-name-search`)
    },
    onRemove(map: Map) {

    },
  })

  new Search({ position: `bottomleft` })
    .addTo(map)
})
</script>
