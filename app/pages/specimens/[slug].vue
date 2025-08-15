<template>
  <article class="container mx-auto flex flex-col space-y-6 pb-24 pt-12">
    <header class="flex flex-col gap-y-1 ml-32">
      <div class="inline-flex items-center text-2xl gap-x-4">
        <h1 class="font-bold">
          {{ specimen?.name ?? 'Unknown' }}
        </h1>
        <div class="inline-flex gap-x-2 items-center">
          <span v-if="specimen?.storage?.entities.at(-1)?.location.public"
            class="px-2 py-1.5 text-sm text-base-97 rounded-md font-semibold uppercase leading-none bg-accent-26"
          >
            On Display
          </span>
          <IconLock v-if="useEnum(Status).valueOf(specimen.status) !== Status.PUBLISHED" class="text-red stroke-2 size-current" />
          <SpecimenEditLink :specimen="specimen" />
        </div>
      </div>
      <div class="inline-flex text-sm leading-none text-base-27 font-semibold uppercase">
        <span class="pr-4 border-r border-base-27">{{ specimen!.id.toUpperCase() }}</span>
        <span class="pl-4">{{classifications.map(({ label }) => label).join(' &raquo; ')}}</span>
      </div>
    </header>
    <div class="flex w-full flex-col space-y-12 items-end">
      <section class="flex w-full justify-start">
        <div class="flex w-full lg:w-3/4 gap-x-2 h-[48rem]">
          <div class="group relative grow size-full">
            <SpecimenImage :category="specimen?.type" :url="specimen?.images?.entities[activeImageIndex]?.uri" width="1280" height="915" class="size-full" />
            <button v-if="(specimen.images?.entities ?? []).length > 1"
              class="absolute left-4 top-[calc(100%/2-1.5rem)] hidden group-hover:flex bg-base-17 hover:bg-accent-26 rounded-sm shadow-lg shadow-base-17/60"
              @click="activeImageIndex = (activeImageIndex - 1 + specimen.images.entities.length) % specimen.images.entities.length">
              <IconAngleDown class="size-12 stroke-base-97 stroke-1.5 rotate-90 fill-none" />
            </button>
            <button v-if="(specimen.images?.entities ?? []).length > 1"
              class="absolute right-4 top-[calc(100%/2-1.5rem)] hidden group-hover:flex bg-base-17 hover:bg-accent-26 rounded-sm shadow-lg shadow-base-17/60"
              @click="activeImageIndex = (activeImageIndex + 1) % specimen.images.entities.length">
              <IconAngleDown class="size-12 stroke-base-97 stroke-1.5 -rotate-90 fill-none" />
            </button>
          </div>
          <Carousel v-if="specimen.images?.entities.length > 1" :orientation="'vertical'" class="flex flex-col flex-none gap-y-2 w-24 h-[48rem] overflow-y-hidden">
            <button v-for="(image, i) in specimen.images.entities"
              :key="image.self"
              type="button"
              :data-index="i"
              :data-status="activeImageIndex === i ? 'active' : 'inactive'" 
              class="group w-full aspect-square data-[status=inactive]:cursor-pointer border border-transparent data-[status=active]:border-accent-26"
              @click="activeImageIndex = i"
            >
              <img 
                :src="`${image.uri}?w=400&h=400`"
                class="group-data-[status=active]:opacity-50 group-data-[status=inactive]:hover:opacity-50" />
            </button>
          </Carousel>
        </div>
      </section>
      <section v-if="specimen?.description" class="w-1/2 mx-auto">
        <h2 class="text-base-27 mb-3 text-lg font-bold text-start uppercase">
          Description
        </h2>
        <div>
          {{ specimen?.description }}
        </div>
      </section>

      <section class="w-1/2 mx-auto">
        <h2 class="text-base-27 mb-3 text-lg font-bold text-start uppercase">Specifications</h2>
        <table class="w-full">
          <tr class="border-b border-base-77 last:border-b-0">
            <th class="py-3 pt-0 text-start text-base-27 font-semibold uppercase">ID</th>
            <td class="py-3 pt-0">{{ specimen?.id.toUpperCase() }}</td>
          </tr>
          <tr class="border-b border-base-77 last:border-b-0">
            <th class="flex flex-col text-start justify-start py-3 text-base-27 font-semibold uppercase">Object name</th>
            <td class="py-3">{{ specimen?.name }}</td>
          </tr>
          <tr class="border-b border-base-77 last:border-b-0">
            <th class="flex flex-col text-start justify-start py-3 text-base-27 font-semibold uppercase">Legal status</th>
            <td class="py-3">{{ useEnum(Legal).valueOf(specimen?.legal) === Legal.PERMANENT ? 'Permanent collection' : 'On loan' }}</td>
          </tr>
          <tr class="border-b border-base-77 last:border-b-0">
            <th class="flex flex-col text-start justify-start py-3 text-base-27 font-semibold uppercase">Category</th>
            <td class="py-3">{{ specimen?.type[0].toUpperCase() + specimen?.type.slice(1) }}</td></tr>
          <tr class="border-b border-base-77 last:border-b-0">
            <th class="flex flex-col text-start justify-start py-3 text-base-27 font-semibold uppercase">Classification</th>
            <td class="py-3">
              <div v-if="specimen.type === 'fossil'" class="flex flex-col w-full">
                <div v-for="classification in classifications.slice(1)" :key="classification.rank" class="flex">
                  <div class="w-28">{{ classification.rank[0].toUpperCase() + classification.rank.slice(1) }}:</div>
                  <div class="grow">{{ classification.label }}</div>
                </div>
              </div>
              <template v-else>
                {{classifications.slice(1).map(({ label }) => label).join(' &raquo; ')}}
              </template>
            </td>
          </tr>
          <tr class="border-b border-base-77 last:border-b-0">
            <th class="flex flex-col text-start justify-start py-3 text-base-27 font-semibold uppercase">Pieces</th>
            <td class="py-3">{{ specimen?.pieces }}</td>
          </tr>
          <tr class="border-b border-base-77 last:border-b-0">
            <th class="flex flex-col text-start justify-start py-3 text-base-27 font-semibold uppercase">Measurements</th>
            <td class="py-3">
              <ul v-if="specimen!.measurements?.count && useEnum(MeasurementCount).valueOf(specimen!.measurements.count) === MeasurementCount.INDIVIDUAL">
                <li v-for="(dimensions) in specimen!.measurements!.dimensions" :key="dimensions.join('x')">
                  {{dimensions.map(d => `${d}mm`).join(' x ')}}
                </li>
              </ul>
              <dl v-else-if="specimen!.measurements?.count && useEnum(MeasurementCount).valueOf(specimen!.measurements.count) === MeasurementCount.AGGREGATE">
                <div v-for="[label, dimensions] in specimen!.measurements!.dimensions!.slice(0, 3).map<[string, [number, number, number]]>((d, index) => [['Largest', 'Smallest', 'Average'][index], d])" :key="dimensions.join('x')" class="inline-flex space-x-2">
                  <dt>{{ label }}:</dt>
                  <dd>{{dimensions.map(d => `${d}mm`).join(' x ')}}</dd>
                </div>
              </dl>
              <template v-else-if="specimen!.measurements?.count && useEnum(MeasurementCount).valueOf(specimen!.measurements.count) === MeasurementCount.CONTAINER">
                Container: {{ specimen!.measurements!.dimensions![0] }}mm
              </template>
              <template v-else-if="specimen!.measurements?.reason && useEnum(Immeasurabibility).valueOf(specimen!.measurements.reason) === Immeasurabibility.CONDITION">
                Too fragile to measure
              </template>
              <template v-else-if="specimen!.measurements?.reason && useEnum(Immeasurabibility).valueOf(specimen!.measurements.reason) === Immeasurabibility.NUMBER">
                Too many to measure
              </template>
              <template v-else-if="specimen!.measurements?.reason && useEnum(Immeasurabibility).valueOf(specimen!.measurements.reason) === Immeasurabibility.SIZE">
                Too small to measure
              </template>
              <template v-else>Not specified</template>
            </td>
          </tr>
          <tr class="border-b border-base-77 last:border-b-0">
            <th class="flex flex-col text-start justify-start py-3 text-base-27 font-semibold uppercase">Partial</th>
            <td class="py-3">{{ specimen?.partial ? 'Yes' : 'No' }}</td></tr>
          <tr v-if="specimen.type === 'fossil' && specimen.portion" class="border-b border-base-77 last:border-b-0">
            <th class="flex flex-col text-start justify-start py-3 text-base-27 font-semibold uppercase">Portion</th>
            <td class="py-3">{{ specimen.portion.label }}</td>
          </tr>
          <tr v-if="compositionLabels.length" class="border-b border-base-77 last:border-b-0">
            <th class="flex flex-col text-start justify-start py-3 text-base-27 font-semibold uppercase">Composition</th>
            <td class="py-3">
              <ul v-if="specimen?.type === 'mineral'">
                <li v-for="label in compositionLabels" :key="label">{{ label }}</li>
              </ul>
              <template v-else>{{ compositionLabels.join(', ') }}</template>
            </td>
          </tr>
          <tr v-if="specimen?.age?.relative" class="border-b border-base-77 last:border-b-0">
            <th class="flex flex-col text-start justify-start py-3 text-base-27 font-semibold uppercase">Age</th>
            <td class="py-3">
              <div class="flex flex-col w-full">
                <div v-for="(age, division) of relativeAges" :key="division" class="flex">
                  <div class="w-28">{{ division[0].toUpperCase() + division.slice(1) }}:</div>
                  <div class="grow">{{ age.join(' to ') }}</div>
                </div>
              </div>
            </td>
          </tr>
          <tr class="border-b border-base-77 last:border-b-0">
            <th class="flex flex-col text-start justify-start py-3 text-base-27 font-semibold uppercase">Numeric age</th>
            <td class="py-3">
              <template v-if="specimen?.age?.numeric">{{specimen?.age?.numeric?.map(mya => Number(mya) / Math.pow(10, 6)).join(' - ')}}</template>
              <template v-else>{{specimen?.age?.relative?.map(({ start }) => Number(start) / Math.pow(10, 6)).join(' - ')}} Mya</template>
            </td>
          </tr>
          <tr class="border-b border-base-77 last:border-b-0">
            <th class="py-3 pb-0 text-start text-base-27 font-semibold uppercase">Origin</th>
            <td class="py-3 pb-0">{{ specimen?.origin?.name }}</td>
          </tr>
        </table>
      </section>
      <section v-if="specimen?.origin?.latitude && specimen?.origin?.longitude" class="w-full lg:w-3/4">
        <h2 class="text-base-27 mb-3 text-lg font-bold text-start uppercase">
          Map of Origin
        </h2>
        <LeafletMap v-if="specimen?.origin?.latitude && specimen?.origin?.longitude" class="min-h-128 w-full" :zoom="7" :center="[specimen.origin.latitude, specimen.origin.longitude]">
          <LeafletMarker
            v-if="specimen.origin"
            :name="specimen?.origin?.name ?? 'Unknown'"
            :center="[specimen?.origin.latitude, specimen?.origin.longitude]"
          >
            <div class="inline-flex gap-2 w-full p-4 text-nowrap text-base-27 font-semibold uppercase">
              {{ specimen.origin.name ?? 'Unknown' }}
            </div>
          </LeafletMarker>
        </LeafletMap>
        <div v-else-if="specimen?.origin?.name">{{ specimen?.origin?.name ?? 'Unknown' }}</div>
      </section>
      <section v-if="publications.length" class="w-full lg:w-3/4">
        <h2 class="text-base-27 mb-3 text-lg font-bold text-start uppercase">
          Publications
        </h2>
        <ul class="list-inside list-decimal">
          <li v-for="(publication, i) in publications" :key="publication.self" class="py-3 first:pt-0 last:pb-0 border-b border-base-77 last:border-b-0">
            <a v-if="publication.doi" :href="publication.doi" class="hover:underline">{{ publication.citation }}</a>
            <template v-else>{{ publication.citation }}</template>
          </li>
        </ul>
      </section>
    </div>
  </article>
</template>

<script setup lang="ts">
import { Immeasurabibility, Legal, MeasurementCount, Status, type Fossil, type Rock, type Specimen } from 'types/specimen'
import { Division } from '~/types/geochronology'

definePageMeta({
  layout: `default`,
})

const { slug } = useRoute().params
const fields: (keyof Specimen)[] = ['age', 'classification', 'collection', 'composition', 'date', 'description', 'id', 'images', 'legal', 'lenderID', 'lenderURL', 'measurements', 'name', 'origin', 'partial', 'pieces', 'publications', 'status', 'storage', 'type']
const { fetchByPK } = useEntityType<Specimen>(`Specimen`)
const { entity: specimen } = await fetchByPK(slug as string, { select: fields })
if (!specimen.value) {
  showError({ statusCode: 404 })
}

const classifications = computed(() => [
  { rank: specimen.value!.classification?.rank, label: specimen.value!.classification?.label },
  ...(specimen.value!.classification?.ancestors?.entities.map(({ rank, label }) => ({ rank, label })) ?? []),
  { label: specimen.value!.type[0].toUpperCase() + specimen.value!.type.slice(1).toLowerCase() + 's' },
].filter(Boolean).reverse())

const compositionLabels = computed(() => {
  if (specimen.value?.type === 'mineral' && specimen.value?.classification?.composition) {
    return [specimen.value.classification.composition]
  } else if (specimen.value?.type === 'mineral' && specimen.value?.classification?.children) {
    return specimen.value.classification.children?.map(({ composition }) => composition)
  } else if ((specimen.value as Fossil | Rock).composition) {
    return (specimen.value as Fossil | Rock).composition?.entities.map(({ label }) => label)
  }
  return []
})

const activeImageIndex = ref(0)

const relativeAges = computed(() => {
  return Object.fromEntries(Object.entries(specimen.value?.age?.relative?.map(({ label, division, ancestors }) => [
    ...ancestors?.entities
      .map(({ label, division }) => ({ label, division })),
    { label, division },
  ])
    .flat()
    ?.reduce((acc, { label, division }) => {
      acc[division] ||= []
      acc[division].push(label)
      return acc
    }, {}) ?? {})
    .map(([division, labels]) => [division, labels.filter((l, i, arr) => arr.indexOf(l) === i)])
    .sort(([divisionA], [divisionB]) => useEnum(Division).valueOf(divisionA) - useEnum(Division).valueOf(divisionB))
  )
})

const publications = computed(() => specimen.value?.publications?.entities ?? [])
</script>

<style>
.leaflet-popup-content {
  @apply bg-base-87 text-base-17 m-0 !w-fit;
}

.leaflet-popup-content-wrapper {
  @apply bg-base-87 rounded-none;
}

.leaflet-popup-tip {
  @apply bg-base-87;
}

.leaflet-popup-close-button {
  @apply hidden;
}
</style>
