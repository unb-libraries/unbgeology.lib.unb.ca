<template>
  <EntityForm :entity="data" @save="onSave">
    <div class="flex flex-row space-x-4">
      <div class="flex w-3/5 flex-col space-y-4">
        <TwFormField label="Name">
          <TwInputText v-model="data.origin.name" class="input input-text-lg" />
        </TwFormField>
        <TwFormField label="Description">
          <TwInputTextArea v-model="data.origin.description" :rows="5" class="input input-textarea-lg" />
        </TwFormField>
        <TwFormField label="Collector">
          <PvInputDropdown v-model="data.collector" :options="affiliates" option-field="self" label-field="label" class="input-select-lg" />
        </TwFormField>
        <TwFormField label="Sponsor">
          <PvInputDropdown v-model="data.sponsor" :options="affiliates" option-field="self" label-field="label" class="input-select-lg" />
        </TwFormField>
      </div>
      <div class="flex w-2/5 flex-col space-y-4">
        <TwFormField label="Place" class="h-full">
          <LeafletMap
            class="border-primary-20 dark:border-primary-60/75 h-full rounded-md border"
            name="origin"
            :zoom="2"
            :center="[data.origin.latitude, data.origin.longitude]"
            @click="setOrigin"
          >
            <LeafletSearch v-model="location" class="input-select-md hover:border-accent-mid text-primary dark:text-primary w-80 rounded-sm bg-white dark:bg-white" />
            <LeafletMarker
              v-if="data.origin.latitude !== undefined && data.origin?.longitude !== undefined"
              :name="data.origin.name"
              :center="[data.origin.latitude, data.origin.longitude]"
              :draggable="true"
              @dragged="setOrigin"
            />
          </LeafletMap>
        </TwFormField>
      </div>
    </div>
  </EntityForm>
</template>

<script setup lang="ts">
import { FilterOperator } from '@unb-libraries/nuxt-layer-entity'
import { type Specimen } from 'types/specimen'
import { type Person, type Organization } from '~/types/affiliate'
import { type Coordinate } from '~/types/leaflet'
import { type Location } from '~/types/nominatim'

const props = defineProps<{
  specimen: Specimen
}>()

const emits = defineEmits<{
  save: [specimen: Specimen]
}>()

const { entities: people } = await fetchEntityList<Person>(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `affiliate/person`]] })
const { entities: organizations } = await fetchEntityList<Organization>(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `affiliate/organization`]] })
const affiliates = computed(() => [...people.value, ...organizations.value].sort(({ label: a }, { label: b }) => a < b ? -1 : a > b ? 1 : 0))
const location = ref<Location>()

const data = reactive({
  origin: {
    ...{
      latitude: 0,
      longitude: 0,
      accuracy: 0,
      name: ``,
      description: ``,
    },
    ...props.specimen.origin,
  },
  collector: props.specimen.collector?.self,
  sponsor: props.specimen.sponsor?.self,
})

const setOrigin = function ([lat, long]: Coordinate) {
  data.origin.latitude = Number(lat)
  data.origin.longitude = Number(long)
}

watch(location, (loc) => {
  if (loc) {
    const { lat, lon, display_name: displayName } = loc
    setOrigin([lat, lon])
    if (!data.origin.name) {
      data.origin.name = displayName
    }
  }
})

function onSave() {
  const { origin, collector, sponsor } = data
  const payload = {
    origin,
    collector: collector || (props.specimen.collector ? null : undefined),
    sponsor: sponsor || (props.specimen.sponsor ? null : undefined),
  }
  emits(`save`, payload)
}
</script>
