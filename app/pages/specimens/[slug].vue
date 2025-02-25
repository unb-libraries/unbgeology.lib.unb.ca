<template>
  <article class="container mx-auto flex flex-col space-y-6 pb-24 pt-12">
    <header class="ml-32">
      <div class="inline-flex items-center space-x-4">
        <h1 class="text-2xl font-bold">
          {{ specimen?.name }}
        </h1>
        <span v-if="status !== Status.PUBLISHED" :class="['rounded-md text-xs px-2 py-1', {
          'bg-yellow text-primary': status === Status.MIGRATED,
          'bg-red-light': status === Status.DRAFT,
          'bg-blue': status === Status.REVIEW,
        }]">{{ useEnum(Status).labelOf(specimen!.status).toUpperCase() }}</span>
      </div>
      <span class="-mt-1 block text-sm italic">#{{ specimen!.id.toUpperCase() }}</span>
    </header>
    <div class="flex w-full flex-col space-y-8 items-end">
      <section class="w-full flex flex-col lg:flex-row gap-8">
        <div v-if="(specimen?.images?.total ?? 0) > 0" class="space-y-1 w-full lg:w-3/4">
          <div class="aspect-7/5 w-full">
            <img :src="`${activeImage?.[1]}?w=1280&h=915`" />
          </div>
          <div class="w-full h-24 inline-flex gap-x-1 overflow-x-scroll">
            <img v-for="{ self, uri } in specimen?.images?.entities" :key="self" :src="`${uri}?w=100&h=100`" :class="['cursor-pointer hover:opacity-50 size-24', { 'opacity-50': self === activeImage?.[0] }]" @click="activeImage = [self, uri]" />
          </div>
        </div>
        <div v-else class="bg-primary-20 dark:bg-primary-60 aspect-7/5 text-base dark:text-primary-40 justify-center items-center flex w-3/4 h-full">
          <IconFossil v-if="specimen!.type === 'fossil'" class="size-48 fill-none stroke-current stroke-1.5" />
          <IconMineral v-else-if="specimen!.type === 'mineral'" class="size-48 fill-none stroke-current stroke-1.5" />
          <IconRock v-else class="size-48 fill-none stroke-current stroke-1.5" />
        </div>
        <dl class="flex flex-col w-full mx-auto lg:w-1/4 lg:gap-y-4">
          <!-- Category -->
          <div class="grid grid-cols-2 lg:grid-cols-1 gap-x-4">
            <dt class="text-end lg:text-start text-primary-40 uppercase font-bold">Category</dt>
            <dd>{{ specimen!.type[0].toUpperCase() + specimen!.type.slice(1).toLowerCase() }}</dd>
          </div>
          <!-- Classification -->
          <div class="grid grid-cols-2 lg:grid-cols-1 gap-x-4">
            <dt class="text-end lg:text-start text-primary-40 uppercase font-bold">Classification</dt>
            <dd>
              <ul v-for="label in classificationLabels" :key="label">
                <li>{{ label }}</li>
              </ul>
            </dd>
          </div>
          <!-- Date -->
          <div class="grid grid-cols-2 lg:grid-cols-1 gap-x-4">
            <dt class="text-end lg:text-start text-primary-40 uppercase font-bold">Date</dt>
            <dd>{{ specimen!.date ?? "Unknown" }}</dd>
          </div>
          <!-- Composition -->
          <div class="grid grid-cols-2 lg:grid-cols-1 gap-x-4">
            <dt class="text-end lg:text-start text-primary-40 uppercase font-bold">Composition</dt>
            <dd>
              <ul v-for="label in compositionLabels" :key="label">
                <li>{{ label }}</li>
              </ul>
            </dd>
          </div>
          <!-- Age -->
          <div class="grid grid-cols-2 lg:grid-cols-1 gap-x-4">
            <dt class="text-end lg:text-start text-primary-40 uppercase font-bold">Age</dt>
            <dd>
              <template v-if="specimen?.age?.relative">
                {{specimen?.age?.relative?.map(({ label, start }, i) => `${label} (${Number(specimen!.age.numeric?.[i] ?? start) / 1000000} Mya)`).join(' - ')}}
              </template>
              <template v-else>Unknown</template>
            </dd>
          </div>
          <!-- Pieces -->
          <div class="grid grid-cols-2 lg:grid-cols-1 gap-x-4">
            <dt class="text-end lg:text-start text-primary-40 uppercase font-bold">Pieces</dt>
            <dd>{{ specimen?.pieces }}{{ specimen?.partial ? ` (Partial)` : `` }}</dd>
          </div>
          <!-- Measurements -->
          <div class="grid grid-cols-2 lg:grid-cols-1 gap-x-4">
            <dt class="text-end lg:text-start text-primary-40 uppercase font-bold">Measurements</dt>
            <dd>
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
              <template v-else-if="specimen!.measurements.reason && useEnum(Immeasurabibility).valueOf(specimen!.measurements.reason) === Immeasurabibility.CONDITION">
                Too fragile to measure
              </template>
              <template v-else-if="specimen!.measurements.reason && useEnum(Immeasurabibility).valueOf(specimen!.measurements.reason) === Immeasurabibility.NUMBER">
                Too many to measure
              </template>
              <template v-else-if="specimen!.measurements.reason && useEnum(Immeasurabibility).valueOf(specimen!.measurements.reason) === Immeasurabibility.SIZE">
                Too small to measure
              </template>
            </dd>
          </div>
          <!-- Storage -->
          <div class="grid grid-cols-2 lg:grid-cols-1 gap-x-4">
            <dt class="text-end lg:text-start text-primary-40 uppercase font-bold">Storage</dt>
            <dd>{{ specimen?.storage?.entities.at(-1)?.location.public ? `On Display` : `In Archive` }}</dd>
          </div>
        </dl>
      </section>
      <section v-if="specimen?.description" class="w-3/4 mx-auto lg:mx-0">
        <h2 class="sr-only text-primary-40 mb-3 text-lg font-bold uppercase">
          Description
        </h2>
        <div>
          {{ specimen?.description }}
        </div>
      </section>
      <section v-if="specimen?.origin" class="w-full lg:w-3/4">
        <h2 class="text-primary-40 mb-3 text-lg font-bold text-center lg:text-start uppercase">
          Place of Origin
        </h2>
        <LeafletMap class="min-h-128 w-full" :zoom="7" :center="[specimen?.origin?.latitude ?? 0, specimen?.origin?.longitude ?? 0]">
          <LeafletMarker
            v-if="specimen.origin"
            :name="specimen.name"
            :center="[specimen?.origin.latitude, specimen?.origin.longitude]"
          />
        </LeafletMap>
      </section>
      <section v-if="publications.length" class="w-full lg:w-3/4">
        <h2 class="text-center lg:text-start mx-auto lg:mx-0 text-primary-40 mb-3 text-lg font-bold uppercase">
          Publications
        </h2>
        <PvEntityList class="list-inside list-decimal" :entities="publications" item-class="my-3 first:mt-0 last:mb-0" v-slot="{ entity: publication }">
          <a :href="publication.doi" class="hover:underline">{{ publication.citation }}</a>
        </PvEntityList>
      </section>
    </div>
  </article>
</template>

<script setup lang="ts">
import { Immeasurabibility, MeasurementCount, Status, type Fossil, type Rock, type Specimen } from 'types/specimen'

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

const classificationLabels = computed(() => [
  specimen.value?.classification?.label,
  ...(specimen.value?.classification?.ancestors?.entities.map(({ label }) => label) ?? []),
].reverse())

const compositionLabels = computed(() => {
  if (specimen.value?.type === 'mineral' && specimen.value?.classification?.composition) {
    return [specimen.value.classification.composition]
  } else if (specimen.value?.type === 'mineral' && specimen.value?.classification?.children) {
    return specimen.value.classification.children?.map(({ composition }) => composition)
  } else if ((specimen.value as Fossil | Rock).composition) {
    return (specimen.value as Fossil | Rock).composition?.entities.map(({ label }) => label)
  }
  return ["Unknown"]
})

const activeImage = ref(specimen?.value?.images?.entities?.length ? [specimen!.value?.images?.entities[0].self, specimen!.value?.images?.entities[0].uri] : undefined)
const publications = computed(() => specimen.value?.publications?.entities ?? [])
const status = computed(() => useEnum(Status).valueOf(specimen.value!.status))
</script>
