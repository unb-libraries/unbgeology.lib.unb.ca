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
              <div class="inline-flex">
                <PvInputText v-model="body.objectID.unb" class="form-input form-input-text grow rounded-r-none" name="objectID" disabled />
                <div class="bg-primary-60 flex h-full items-center rounded-r-lg p-3">
                  <PvCheckbox id="unbowned" v-model="unbOwned" label="Owned by UNB" name="unbowned" @change="body.objectID.unb = !unbOwned ? `UNB-X${body.objectID.unb.substring(5)}` : `UNB-0${body.objectID.unb.substring(5)}`" />
                </div>
              </div>
            </div>

            <!-- Lender ID -->
            <div v-if="!unbOwned" class="form-field w-1/4">
              <label for="lenderId">External ID</label>
              <PvInputText v-model="body.objectID.external" class="form-input form-input-text" name="lenderId" />
            </div>

            <!-- International Index Number -->
            <div class="form-field">
              <label for="intId">International Index Number</label>
              <PvInputText v-model="body.objectID.international" class="form-input form-input-text" name="intId" />
            </div>

            <!-- Other ID -->
            <div class="form-field">
              <label for="otherId">Other ID</label>
              <PvInputText class="form-input form-input-text" name="otherId" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-col w-1/2">
              <!-- Classification -->
              <div class="form-field">
                <label for="classification">Classification</label>
                <EntityInputSelect
                  v-model="body.classification"
                  :options="classifications"
                  option-label="label"
                  class="form-input form-input-pvselect"
                  name="classification"
                />
              </div>

              <!-- Description -->
              <div class="form-field">
                <label for="description">Description</label>
                <textarea v-model="body.description" class="form-input form-input-textarea" name="description" rows="8" />
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
          <h2 class="divider">
            Specimen details
          </h2>
          <div class="form-col">
            <div class="form-row">
              <!-- Portion -->
              <div class="form-field w-4/5">
                <label for="portion">Portion</label>
                <EntityInputSelect
                  v-model="body.portion"
                  :options="portions"
                  option-label="label"
                  class="form-input form-input-pvselect"
                  name="portion"
                />
              </div>

              <!-- Pieces -->
              <div class="form-field">
                <label for="pieces">Pieces</label>
                <div class="inline-flex">
                  <PvInputNumber v-model="body.pieces" input-class="form-input form-input-number rounded-r-none" name="pieces" />
                  <div class="bg-primary-60 flex h-full items-center rounded-r-lg p-3">
                    <PvCheckbox id="partial" v-model="body.partial" label="Partial" name="partial" />
                  </div>
                </div>
              </div>
            </div>
            <div class="form-row form-row-3">
              <!-- Age -->
              <div class="form-field">
                <label for="age-relative">Age (relative)</label>
                <EntityInputSelect
                  v-model="body.age.relative"
                  class="form-input form-input-pvselect"
                  name="age-relative"
                  :options="ageUnits"
                  option-label="label"
                />
              </div>

              <!-- Age -->
              <div class="form-field">
                <label for="age-numeric">Age (numeric)</label>
                <div class="inline-flex">
                  <PvInputNumber
                    v-model="body.age.numeric"
                    name="age-numeric"
                    :max-fraction-digits="2"
                    :min-fraction-digits="2"
                    min="0"
                    class="w-full"
                    input-class="form-input form-input-number rounded-r-none"
                  />
                  <div class="bg-primary-60 h-full rounded-r-lg p-3">
                    Ma
                  </div>
                </div>
              </div>

              <!-- Composition -->
              <div class="form-field">
                <label for="composition">Composition</label>
                <PvInputSelect v-model="body.composition" class="form-input form-input-pvselect" name="composition" :options="['solid']" />
              </div>
            </div>

            <div class="form-field">
              <span class="form-field-label">Measurements</span>
              <div class="grid gap-6" :class="`grid-cols-${Math.min(4, body.pieces)}`">
                <div v-for="(_, index) in padMeasurements(body.measurements, body.pieces)" :key="index" class="form-field">
                  <div class="inline-flex">
                    <div class="bg-primary-60 h-full rounded-l-lg p-3">
                      <label :for="`width-${index}`">W</label>
                      <span class="mx-1">x</span>
                      <label :for="`length-${index}`">L</label>
                    </div>
                    <div class="divide-primary-60/75 hover:divide-accent-light inline-flex w-full divide-x">
                      <PvInputNumber v-model="body.measurements[index].width" class="w-full" input-class="form-input form-input-number border-r-0 rounded-none" :name="`width-${index}`" />
                      <PvInputNumber v-model="body.measurements[index].length" class="w-full" input-class="form-input form-input-number border-l-0 rounded-none" :name="`length-${index}`" />
                    </div>
                    <div class="bg-primary-60 h-full rounded-r-lg p-3">
                      mm
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="divider">
            Origin details
          </h2>
          <div class="form-row">
            <div class="form-col w-1/2">
              <!-- Date -->
              <div class="form-field">
                <label for="date">Date</label>
                <PvInputMask v-model="body.date" class="form-input form-input-text" name="date" mask="9999?/99/99" placeholder="YYYY/MM/DD" />
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
                    class="form-input form-input-pvselect rounded-r-none"
                  />
                  <button class="form-action form-action-submit rounded-l-none font-normal" @click.prevent="content = { component: FormPerson, props: { entity: {}}, eventHandlers: { save: onSavePerson, cancel: closeModal }}">
                    Add
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
                    class="form-input form-input-pvselect rounded-r-none"
                  />
                  <button class="form-action form-action-submit rounded-l-none font-normal" @click.prevent="content = { component: FormPerson, props: { entity: {}}, eventHandlers: { save: onSavePerson, cancel: closeModal }}">
                    Add
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
          <h2 class="divider">
            Misc
          </h2>
          <!-- Publications -->
          <div class="form-field group">
            <label for="publications">Publications</label>
            <EntityInputInlineForm v-model="body.publications" input-class="form-input form-input-text rounded-r-none" :form="FormPublication" :label="({ citation: cit }: Publication) => cit.substring(0, cit.indexOf(`,`))" />
          </div>
        </section>
      </div>
    </template>
  </EntityForm>
</template>

<script setup lang="ts">
import { type EntityJSONProperties, type Image, type EntityJSONBody, type TaxonomyTerm, type Term } from 'layers/base/types/entity'
import { type Specimen, type Publication, type Measurement } from 'types/specimen'
import { type Unit } from 'types/vocabularies/geochronology'
import { type Person } from 'types/affiliation'
import type { Coordinate } from 'types/leaflet'
import type { Location } from 'types/nominatim'
import { FormPublication, FormPerson } from '#components'

const props = defineProps<{
  specimen?: Partial<EntityJSONProperties<Specimen>>
  category: string
}>()

const emits = defineEmits<{
  save: [specimen: EntityJSONBody<Specimen>]
}>()

const { content, close: closeModal } = useModal()

const unbOwned = ref(true)

const defaultId = `${Math.floor(Math.random() * 1000000)}`
const specimen = computed(() => ({
  category: props.category,
  objectID: {
    unb: `UNB-${defaultId.padStart(8, `0`)}`,
  },
  age: {},
  origin: {},
  pieces: 1,
  measurements: [{}],
  ...props.specimen,
}))

const specimenType = props.category.substring(0, 1).toUpperCase() + props.category.substring(1)
const { entities: classifications } = await fetchEntityList<TaxonomyTerm>(`${specimenType}.Classification`)
const { entities: images } = await fetchEntityList<Image>(`Image`)
const { entities: portions } = await fetchEntityList<Term>(`${specimenType}.Portion`)
const { entities: ageUnits } = await fetchEntityList<Unit>(`Geochronology`)
const { entities: people, add: addPerson } = await fetchEntityList<Person>(`People`)

async function onSavePerson(person: EntityJSONBody<Person>) {
  await addPerson(person)
  closeModal()
}

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
</script>
