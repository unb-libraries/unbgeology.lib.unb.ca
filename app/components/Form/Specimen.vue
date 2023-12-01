<template>
  <EntityForm :entity="specimen" @save="onSave">
    <template #default="{ body }">
      <div class="flex flex-col space-y-36">
        <section class="form-col">
          <!-- IDs -->
          <div class="form-row" :class="{ 'form-row-3': unbOwned, 'form-row-4': !unbOwned }">
            <!-- ID -->
            <div class="form-field">
              <label for="objectId">ID</label>
              <div class="border-primary-60/75 inline-flex">
                <PvInputText v-model="body.objectID.unb" class="disabled:bg-primary-80 disabled:text-primary-40 grow rounded-r-none" name="objectID" disabled />
                <div class="bg-primary-60 form-input-checkbox rounded-r-lg p-3">
                  <input id="unbOwned" v-model="unbOwned" type="checkbox" name="unbOwned" @change="body.objectID.unb = !unbOwned ? `UNB-X${body.objectID.unb.substring(5)}` : `UNB-0${body.objectID.unb.substring(5)}`">
                  <label for="unbOwned" class="mx-3">Owned by UNB</label>
                </div>
              </div>
            </div>

            <!-- Lender ID -->
            <div v-if="!unbOwned" class="form-field w-1/4">
              <label for="lenderId">External ID</label>
              <PvInputText v-model="body.objectID.external" name="lenderId" />
            </div>

            <!-- International Index Number -->
            <div class="form-field">
              <label for="intId">International Index Number</label>
              <PvInputText v-model="body.objectID.international" name="intId" />
            </div>

            <!-- Other ID -->
            <div class="form-field">
              <label for="otherId">Other ID</label>
              <PvInputText name="otherId" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-col w-1/2">
              <!-- Name -->
              <div class="form-field">
                <label for="name">Name</label>
                <PvInputText v-model="body.name" name="name" />
              </div>

              <!-- Description -->
              <div class="form-field">
                <label for="description">Description</label>
                <textarea v-model="body.description" class="dark:bg-primary border-primary-20 dark:border-primary-60/75 hover:border-accent-light dark:focus:border-accent-mid rounded-lg border p-2" name="description" rows="8" />
              </div>
            </div>

            <div class="form-col w-1/2">
              <!-- Images -->
              <div class="form-field h-full">
                <label for="images">Images</label>
                <PvInputImageGallery v-model="body.images" :images="images" name="images" class="border-primary-20 dark:border-primary-60/75 hover:border-accent-light h-full rounded-lg border p-3" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="form-section-heading">
            Specimen details
          </h2>
          <div class="form-col">
            <div class="form-row">
              <!-- Classifications -->
              <div class="form-field w-4/5">
                <label for="classifications">Classifications</label>
                <EntityInputSelect
                  v-model="body.classifications"
                  :multi="true"
                  :options="classifications"
                  option-label="label"
                  display="chip"
                  name="classifications"
                />
              </div>

              <!-- Pieces -->
              <div class="form-field">
                <label for="pieces">Pieces</label>
                <div class="border-primary-60/75 inline-flex">
                  <PvInputNumber v-model="body.pieces" class="rounded-r-none" name="pieces" :pt="{ input: { class: `rounded-r-none w-full` }}" />
                  <div class="bg-primary-60 form-input-checkbox rounded-r-lg p-3">
                    <input id="partial" v-model="body.partial" type="checkbox" name="partial">
                    <label for="partial" class="mx-3">Partial</label>
                  </div>
                </div>
              </div>
            </div>
            <div class="form-row form-row-3">
              <!-- Age -->
              <div class="form-field">
                <label for="age-relative">Age (relative)</label>
                <EntityInputSelect v-model="body.age.relative" name="age-relative" :options="ageUnits" option-label="label" />
              </div>

              <!-- Age -->
              <div class="form-field">
                <label for="age-numeric">Age (numeric)</label>
                <div class="border:primary-60/75 inline-flex">
                  <PvInputNumber v-model="body.age.numeric" name="age-numeric" max-fraction-digits="2" min="0" :pt="{ input: { class: `rounded-r-none w-full` }}" />
                  <span class="bg-primary-60 rounded-r-lg p-3">Ma</span>
                </div>
              </div>

              <!-- Composition -->
              <div class="form-field">
                <label for="composition">Composition</label>
                <PvInputSelect v-model="body.composition" name="composition" :options="['solid']" />
              </div>
            </div>

            <div class="form-field">
              <span class="label">Measurements</span>
              <div class="grid gap-6" :class="`grid-cols-${Math.min(4, body.pieces)}`">
                <div v-for="(_, index) in padMeasurements(body.measurements, body.pieces)" :key="index" class="form-field">
                  <div class="border-primary-60/75 inline-flex">
                    <div class="bg-primary-60 inline-flex rounded-l-lg p-3 align-middle">
                      <label :for="`width-${index}`">W</label>
                      <span class="mx-1">x</span>
                      <label :for="`length-${index}`">L</label>
                    </div>
                    <div class="divide-primary-60/75 hover:divide-accent-light inline-flex flex-1 divide-x">
                      <PvInputNumber v-model="body.measurements[index].width" :name="`width-${index}`" :pt="{ input: { class: `w-full rounded-none border-r-0` }}" />
                      <PvInputNumber v-model="body.measurements[index].length" :name="`length-${index}`" :pt="{ input: { class: `w-full rounded-l-none border-l-0` }}" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="form-section-heading">
            Origin details
          </h2>
          <div class="form-row">
            <div class="form-col w-1/2">
              <!-- Date -->
              <div class="form-field">
                <label for="date">Date</label>
                <PvInputMask v-model="body.date" name="date" mask="9999?/99/99" placeholder="YYYY/MM/DD" />
              </div>

              <!-- Collector -->
              <div class="form-field">
                <label for="collector">Collector</label>
                <div class="inline-flex">
                  <EntityInputSelect
                    v-model="body.collector"
                    :options="people"
                    :option-label="(person) => `${person.firstName} ${person.lastName}`"
                    name="collector"
                    class="rounded-r-none"
                  />
                  <button class="form-action form-action-submit rounded-l-none font-normal" @click="showPersonForm = true">
                    Add
                    <PvModal v-if="showPersonForm">
                      <FormPerson v-if="showPersonForm" :person="newPerson" @save="onSaveNewPerson" @cancel="showPersonForm = false" />
                    </PvModal>
                  </button>
                </div>
              </div>

              <!-- Sponsor -->
              <div class="form-field">
                <label for="sponsor">Sponsor</label>
                <div class="inline-flex">
                  <EntityInputSelect
                    v-model="body.sponsor"
                    :options="people"
                    :option-label="(person) => `${person.firstName} ${person.lastName}`"
                    name="Sponsor"
                    class="rounded-r-none"
                  />
                  <button class="form-action form-action-submit rounded-l-none font-normal" @click="showPersonForm = true">
                    Add
                    <PvModal v-if="showPersonForm">
                      <FormPerson v-if="showPersonForm" :person="newPerson" @save="onSaveNewPerson" @cancel="showPersonForm = false" />
                    </PvModal>
                  </button>
                </div>
              </div>
            </div>

            <div class="form-col w-1/2">
              <!-- Origin -->
              <div class="form-field h-full w-full">
                <label for="origin">Origin</label>
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
        </section>

        <section>
          <h2 class="form-section-heading">
            Misc
          </h2>
          <!-- Publications -->
          <div class="form-field group">
            <label for="publications">Publications</label>
            <EntityInputInlineForm v-model="body.publications" :form="FormPublication" :label="({ citation: cit }: Publication) => cit.substring(0, cit.indexOf(`,`))" />
          </div>
        </section>
      </div>
    </template>
  </EntityForm>
</template>

<script setup lang="ts">
import { EntityJSONProperties, type Image, EntityJSONBody } from 'layers/base/types/entity'
import { type Specimen, type Publication, type Measurement } from 'types/specimen'
import { type GeochronologicUnit, type Classification } from 'types/taxonomy'
import { type Person } from 'types/affiliation'
import type { Coordinate } from 'types/leaflet'
import type { Location } from 'types/nominatim'
import { FormPublication } from '#components'

defineProps<{
  specimen: EntityJSONProperties<Specimen>
}>()

const emits = defineEmits<{
  save: [specimen: EntityJSONBody<Specimen>]
}>()

const unbOwned = ref(true)

const { list: imageEntityList } = await fetchEntityList<Image>(`/api/files/image`)
const images = computed(() => imageEntityList.value?.entities ?? [])

const { list: classificationList } = await fetchEntityList<Classification>(`/api/taxonomies/classification`)
const classifications = computed(() => classificationList.value?.entities ?? [])

const { list: ageUnitList } = await fetchEntityList<GeochronologicUnit>(`/api/taxonomies/geochronology`)
const ageUnits = computed(() => ageUnitList.value?.entities ?? [])

const { fetchAll: fetchAllPeople, create: createPerson } = useEntityType<Person>(Symbol(`affiliations`), `people`)
const { list: peopleList, refresh: refreshPeopleList } = await fetchAllPeople()
const people = computed(() => peopleList.value?.entities ?? [])

const showPersonForm = ref(false)
const newPerson = ref({} as EntityJSONProperties<Person>)

function padMeasurements(measurements: Measurement[], length: number) {
  if (measurements.length < length) {
    measurements.push(...Array.from(Array(length - measurements.length)).map(_ => ({} as Measurement)))
  } else if (measurements.length > length) {
    measurements.splice(length - 1, measurements.length - length)
  }
  return measurements
}

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
  showPersonForm.value = false
}
</script>
