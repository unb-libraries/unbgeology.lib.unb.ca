<template>
  <EntityForm :entity="data">
    <template #default="{ body }">
      <div class="flex flex-row space-x-4">
        <div class="flex w-3/5 flex-col space-y-4">
          <TwFormField label="Name">
            <TwInputText v-model="body.origin.name" class="input input-text-lg" />
          </TwFormField>
          <TwFormField label="Description">
            <TwInputTextArea v-model="body.origin.description" :rows="5" class="input input-textarea-lg" />
          </TwFormField>
          <TwFormField label="Collector">
            <PvInputDropdown v-model="body.collector" :options="affiliates" option-field="self" label-field="label" class="input-select-lg" />
          </TwFormField>
          <TwFormField label="Sponsor">
            <PvInputDropdown v-model="body.sponsor" :options="affiliates" option-field="self" label-field="label" class="input-select-lg" />
          </TwFormField>
        </div>
        <div class="flex w-2/5 flex-col space-y-4">
          <TwFormField label="Place" class="h-full">
            <LeafletMap
              class="border-primary-20 dark:border-primary-60/75 h-full rounded-md border"
              name="origin"
              :zoom="2"
              :center="[body.origin?.latitude ?? 0, body.origin?.longitude ?? 0]"
              @click="coord => {
              // setOrigin(coord, body)
              }"
            >
              <!-- <LeafletSearch @item-select="item => onSearchItemSelect(item, body)" /> -->
              <LeafletMarker
                v-if="body.origin.latitude !== undefined && body.origin?.longitude !== undefined"
                :name="body.origin.name"
                :center="[body.origin.latitude, body.origin.longitude]"
                :draggable="true"
                @dragged="coord => {
                  // setOrigin(coord, body)
                }"
              />
            </LeafletMap>
          </TwFormField>
        </div>
      </div>
    </template>
  </EntityForm>
</template>

<script setup lang="ts">
import { FilterOperator } from '@unb-libraries/nuxt-layer-entity'
import { type Specimen } from 'types/specimen'

const props = defineProps<{
  specimen?: Specimen
}>()

const emits = defineEmits<{
  save: [specimen: Specimen]
}>()

const { entities: people } = await fetchEntityList(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `affiliate/person`]] })
const { entities: organizations } = await fetchEntityList(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `affiliate/organization`]] })
const affiliates = computed(() => [...people.value, ...organizations.value])

const data = reactive({
  origin: {
    latitude: 0,
    longitude: 0,
    accuracy: 0,
    name: ``,
    description: ``,
  },
  collector: undefined as string | undefined,
  sponsor: undefined as string | undefined,
})
</script>
