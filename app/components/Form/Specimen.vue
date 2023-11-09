<template>
  <EntityForm :entity="specimen" cancel-url="/dashboard/specimens" @save="onSave">
    <template #default="{ body }">
      <div class="flex flex-col md:flex-row">
        <div class="mr-4 grow">
          <div class="flex flex-col">
            <label class="mb-2 text-lg font-bold" for="name">Name</label>
            <PvInputText v-model="body.name" name="name" />
          </div>
          <div class="my-6 flex flex-col">
            <label class="mb-2 text-lg font-bold" for="date">Date</label>
            <PvInputMask v-model="body.date" name="date" mask="9999?/99/99" placeholder="YYYY/MM/DD" />
          </div>
          <div class="my-6 flex flex-row">
            <div class="mr-3 flex w-1/2 flex-col">
              <label class="mb-2 text-lg font-bold" for="age">Age</label>
              <PvInputSelect v-model="body.age" name="age" :options="['Cretaceous', 'Eocene', 'Ordovician', 'Holocene', 'Precambrian']" />
            </div>
            <div class="ml-3 flex w-1/2 flex-col">
              <label class="mb-2 text-lg font-bold" for="composition">Composition</label>
              <PvInputSelect v-model="body.composition" name="composition" :options="['solid']" />
            </div>
          </div>
          <div class="my-6 flex flex-row">
            <div class="mr-3 flex w-1/2 flex-col">
              <label class="mb-2 text-lg font-bold" for="width">Width</label>
              <PvInputNumber v-model="body.dimensions!.width" name="width" />
            </div>
            <div class="ml-3 flex w-1/2 flex-col">
              <label class="mb-2 text-lg font-bold" for="length">Length</label>
              <PvInputNumber v-model="body.dimensions!.length" name="length" />
            </div>
          </div>
          <div class="mt-6 flex flex-row">
            <div class="mr-3 flex w-1/2 flex-col">
              <label class="mb-2 text-lg font-bold" for="pieces">Pieces</label>
              <PvInputNumber v-model="body.pieces" name="pieces" />
            </div>
            <div class="ml-3 flex w-1/2 flex-col">
              <label class="mb-2 text-lg font-bold">Partial</label>
              <div name="partial" class="flex h-full flex-row items-center">
                <div class="mr-6">
                  <input
                    id="partial-yes"
                    v-model="body.partial"
                    type="radio"
                    name="partial"
                    value="true"
                    class="dark:bg-primary border-primary-20 dark:border-primary-60/75 hover:border-accent-light checked:border-accent-mid focus:ring-accent-light/50 focus:ring-offset-base dark:focus:ring-offset-primary h-6 w-6 cursor-pointer appearance-none rounded-full border bg-white align-middle checked:border-8 focus:ring-2 focus:ring-offset-2"
                  >
                  <label class="mx-3 align-middle" for="partial-yes">Yes</label>
                </div>
                <div>
                  <input
                    id="partial-no"
                    v-model="body.partial"
                    type="radio"
                    name="partial"
                    value="false"
                    class="dark:bg-primary border-primary-20 dark:border-primary-60/75 hover:border-accent-light checked:border-accent-mid focus:ring-accent-light/50 focus:ring-offset-base dark:focus:ring-offset-primary h-6 w-6 cursor-pointer appearance-none rounded-full border bg-white align-middle checked:border-8 focus:ring-2 focus:ring-offset-2"
                  >
                  <label class="mx-3 align-middle" for="partial-no">No</label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="w-full md:ml-4 md:w-1/2">
          <div class="flex h-full w-full flex-col">
            <label class="mb-2 text-lg font-bold" for="origin">Origin</label>
            <LeafletMap class="border-primary-20 dark:border-primary-60/75 h-full rounded-md border" name="origin" :zoom="2" :center="[body.origin?.latitude ?? 0, body.origin?.longitude ?? 0]" @click="coord => setOrigin(coord, body)">
              <LeafletSearch @item-select="item => onSearchItemSelect(item, body)" />
              <LeafletMarker
                v-if="body.origin?.latitude !== undefined && body.origin?.longitude !== undefined"
                :name="body.name"
                :center="[body.origin.latitude, body.origin.longitude]"
                :draggable="true"
                @dragged="coord => setOrigin(coord, body)"
              />
            </LeafletMap>
          </div>
        </div>
      </div>
      <div class="mt-6 flex flex-col">
        <label class="mb-2 w-full text-lg font-bold" for="description">Description</label>
        <textarea v-model="body.description" class="dark:bg-primary border-primary-20 dark:border-primary-60/75 hover:border-accent-light dark:focus:border-accent-mid rounded-lg border p-2" name="description" rows="10" />
      </div>
      <div class="mt-6 flex flex-col">
        <label class="mb-2 w-full text-lg font-bold" for="images">Images</label>
        <PvInputImageGallery v-model="body.images" :images="images" name="images" />
      </div>
      <div class="mt-6 flex flex-col">
        <label class="mb-2 w-full text-lg font-bold" for="classifications">Classifications</label>
        <PvInputMultiSelect
          v-model="body.classifications"
          :options="classifications"
          option-label="label"
          option-value="self"
          display="chip"
          name="classifications"
        />
      </div>
      <div class="my-6 flex flex-col">
        <label class="mb-2 w-full text-lg font-bold" for="collector-sponsor">Collector / Sponsor</label>
        <div class="flex flex-row">
          <div name="collector-sponsor" class="flex flex-row">
            <div class="flex flex-row rounded-l-md p-3" :class="{ 'bg-primary-80': collectorOrSponsor, 'bg-primary border-primary-60/75 border': !collectorOrSponsor }">
              <input
                id="collector"
                v-model="collectorOrSponsor"
                type="radio"
                name="collector-sponsor"
                :value="true"
                class="dark:bg-primary border-primary-20 dark:border-primary-60/75 hover:border-accent-light checked:border-accent-mid focus:ring-accent-light/50 focus:ring-offset-base dark:focus:ring-offset-primary h-6 w-6 cursor-pointer appearance-none rounded-full border bg-white align-middle checked:border-8 focus:ring-2 focus:ring-offset-2"
              >
              <label class="mx-3 align-middle" for="collector">Collector</label>
            </div>
            <div class="flex flex-row p-3" :class="{ 'bg-primary-80': !collectorOrSponsor, 'bg-primary border-primary-60/75 border border-r-0': collectorOrSponsor }">
              <input
                id="sponsor"
                v-model="collectorOrSponsor"
                type="radio"
                name="collector-sponsor"
                :value="false"
                class="dark:bg-primary border-primary-20 dark:border-primary-60/75 hover:border-accent-light checked:border-accent-mid focus:ring-accent-light/50 focus:ring-offset-base dark:focus:ring-offset-primary h-6 w-6 cursor-pointer appearance-none rounded-full border bg-white align-middle checked:border-8 focus:ring-2 focus:ring-offset-2"
              >
              <label class="mx-3 align-middle" for="sponsor">Sponsor</label>
            </div>
          </div>
          <EntityInputSelect
            v-if="collectorOrSponsor"
            v-model="body.collector"
            :options="people"
            :option-label="(collector) => `${collector.firstName} ${collector.lastName}`"
            name="sponsor"
            class="rounded-none"
          />
          <EntityInputSelect
            v-else
            v-model="body.sponsor"
            :options="people"
            :option-label="(sponsor) => `${sponsor.firstName} ${sponsor.lastName}`"
            name="sponsor"
            class="rounded-none"
          />
          <button class="bg-accent-mid cursor-pointer rounded-r-md p-3" @click.prevent="displayCollectorForm = true">
            Create
          </button>
        </div>
        <FormPerson v-if="displayCollectorForm" :person="newPerson" @save="onSaveNewPerson" @cancel="displayCollectorForm = false" />
      </div>
    </template>
  </EntityForm>
</template>

<script setup lang="ts">
import { EntityJSONProperties, type Image, EntityJSONBody } from 'layers/base/types/entity'
import { type Specimen } from 'types/specimen'
import { type Classification } from 'types/taxonomy'
import { type Person } from 'types/affiliation'
import type { Coordinate } from 'types/leaflet'
import type { Location } from 'types/nominatim'

const props = defineProps<{
  specimen: EntityJSONProperties<Specimen>
}>()

const emits = defineEmits<{
  save: [specimen: EntityJSONBody<Specimen>]
}>()

const { list: imageEntityList } = await fetchEntityList<Image>(`/api/files/image`)
const images = computed(() => imageEntityList.value?.entities ?? [])

const { list: classificationList } = await fetchEntityList<Classification>(`/api/taxonomies/classification`)
const classifications = computed(() => classificationList.value?.entities ?? [])

const { fetchAll: fetchAllPeople, create: createPerson } = useEntityType<Person>(Symbol(`affiliations`), `people`)
const { list: peopleList, refresh: refreshPeopleList } = await fetchAllPeople()
const people = computed(() => peopleList.value?.entities ?? [])

const collectorOrSponsor = ref(props.specimen.collector ? true : props.specimen.sponsor === undefined)
const displayCollectorForm = ref(false)
const newPerson = ref({} as EntityJSONProperties<Person>)

const setOrigin = function (coord: Coordinate, specimen: EntityJSONBody<Specimen>) {
  const [newLat, newLong] = coord
  specimen.origin = {
    latitude: newLat,
    longitude: newLong,
    accuracy: 0,
  }
}

const onSearchItemSelect = function (item: Location, specimen: EntityJSONBody<Specimen>) {
  const { lat, lon } = item
  setOrigin([lat, lon], specimen)
}

const onSave = (specimen: EntityJSONBody<Specimen>) => {
  emits(`save`, specimen)
}

const onSaveNewPerson = async (person: EntityJSONBody<Person>) => {
  await createPerson(person)
  refreshPeopleList()
  newPerson.value = {} as EntityJSONProperties<Person>
  displayCollectorForm.value = false
}
</script>
