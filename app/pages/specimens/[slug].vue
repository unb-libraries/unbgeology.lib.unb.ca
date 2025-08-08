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
        <span class="pl-4">{{ classificationLabels.join(' &raquo; ') }}</span>
      </div>
    </header>
    <div class="flex w-full flex-col space-y-12 items-end">
      <section class="flex w-full justify-start">
        <div class="flex w-full lg:w-3/4 gap-x-2 aspect-7/5">
          <SpecimenImage :specimen :url="activeImage?.uri" width="1280" height="915" class="grow aspect-7/5" />
          <div class="flex flex-col flex-none gap-y-2 w-24 h-full overflow-y-hidden">
            <button v-for="(image, i) in specimen.images?.entities ?? []"
              :key="image.self"
              type="button"
              :data-index="i"
              :data-status="image.self === activeImage?.self ? 'active' : 'inactive'" 
              class="group w-full aspect-square data-[status=inactive]:cursor-pointer"
              @click="activeImage = image"
            >
              <img 
                :src="`${image.uri}?w=400&h=400`"
                class="group-data-[status=active]:opacity-50 group-data-[status=inactive]:hover:opacity-50" />
            </button>
          </div>
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
            <td class="py-3 pt-0 text-sm text-base-27 font-semibold uppercase">ID</td>
            <td class="py-3 pt-0">{{ specimen?.id.toUpperCase() }}</td>
          </tr>
          <tr class="border-b border-base-77 last:border-b-0">
            <td class="py-3 text-sm text-base-27 font-semibold uppercase">Object name</td>
            <td class="py-3">{{ specimen?.name }}</td>
          </tr>
          <tr class="border-b border-base-77 last:border-b-0">
            <td class="py-3 text-sm text-base-27 font-semibold uppercase">Legal status</td>
            <td class="py-3">{{ useEnum(Legal).valueOf(specimen?.legal) === Legal.PERMANENT ? 'Permanent collection' : 'On loan' }}</td>
          </tr>
          <tr class="border-b border-base-77 last:border-b-0">
            <td class="py-3 text-sm text-base-27 font-semibold uppercase">Category</td>
            <td class="py-3">{{ specimen?.type[0].toUpperCase() + specimen?.type.slice(1) }}</td></tr>
          <tr class="border-b border-base-77 last:border-b-0">
            <td class="py-3 text-sm text-base-27 font-semibold uppercase">Classification</td>
            <td class="py-3">
              {{[...specimen?.classification?.ancestors?.entities?.map(({ label }) => label) ?? [], specimen?.classification?.label].filter(Boolean).join(' &raquo; ')}}
            </td>
          </tr>
          <tr class="border-b border-base-77 last:border-b-0">
            <td class="py-3 text-sm text-base-27 font-semibold uppercase">Pieces</td>
            <td class="py-3">{{ specimen?.pieces }}</td></tr>
          <tr class="border-b border-base-77 last:border-b-0">
            <td class="py-3 text-sm text-base-27 font-semibold uppercase">Partial</td>
            <td class="py-3">{{ specimen?.partial ? 'Yes' : 'No' }}</td></tr>
          <tr v-if="specimen.type === 'fossil'">
            <td>Portion</td>
            <td>{{ specimen?.portion?.label }}</td>
          </tr>
          <tr v-if="compositionLabels.length" class="border-b border-base-77 last:border-b-0">
            <td class="py-3 text-sm text-base-27 font-semibold uppercase">Composition</td>
            <td class="py-3">
              <ul v-if="specimen?.type === 'mineral'">
                <li v-for="label in compositionLabels" :key="label">{{ label }}</li>
              </ul>
              <template v-else>{{ compositionLabels.join(', ') }}</template>
            </td>
          </tr>
          <tr v-if="specimen?.age?.relative" class="border-b border-base-77 last:border-b-0">
            <td class="py-3 text-sm text-base-27 font-semibold uppercase">Age</td>
            <td class="py-3">
              {{specimen?.age?.relative?.map(({ label }) => label).join(' to ')}}
            </td>
          </tr>
          <tr class="border-b border-base-77 last:border-b-0">
            <td class="py-3 text-sm text-base-27 font-semibold uppercase">Numeric age</td>
            <td class="py-3">
              <template v-if="specimen?.age?.numeric">{{specimen?.age?.numeric?.map(mya => Number(mya) / Math.pow(10, 6)).join(' - ')}}</template>
              <template v-else>{{specimen?.age?.relative?.map(({ start }) => Number(start) / Math.pow(10, 6)).join(' - ')}} Mya</template>
            </td>
          </tr>
          <tr class="border-b border-base-77 last:border-b-0">
            <td class="py-3 text-sm text-base-27 font-semibold uppercase">Origin</td>
            <td class="py-3">{{ specimen?.origin?.name }}</td>
          </tr>
          <tr class="border-b border-base-77 last:border-b-0">
            <td class="py-3 pb-0 text-sm text-base-27 font-semibold uppercase">Measurements</td>
            <td class="py-3 pb-0">
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
  specimen.value!.classification?.label,
  ...(specimen.value!.classification?.ancestors?.entities.map(({ label }) => label) ?? []),
  specimen.value!.type[0].toUpperCase() + specimen.value!.type.slice(1).toLowerCase() + 's',
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

const activeImage = ref(specimen?.value?.images?.entities?.[0])
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
