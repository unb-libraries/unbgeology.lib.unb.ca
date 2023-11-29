<template>
  <article class="container mx-auto flex flex-col space-y-6 pb-24 pt-12">
    <header class="ml-32">
      <h1 class="text-2xl font-bold">
        {{ specimen?.name }}
      </h1>
      <span class="-mt-1 block text-sm italic">#{{ specimen?.id }}</span>
    </header>
    <div class="flex flex-row space-x-8">
      <div class="flex w-2/3 flex-col space-y-12">
        <section>
          <nuxt-img :src="`/image/${specimen?.images[0].filename}`" format="webp" fit="cover" width="1024" height="731" />
        </section>
        <section class="ml-64 text-justify">
          {{ specimen?.description }}
        </section>
        <section class="ml-64 w-full">
          <h2 class="text-primary-40 mb-3 text-lg font-bold uppercase">
            Place of Origin
          </h2>
          <LeafletMap class="h-96 w-full" :zoom="7" :center="[specimen?.origin?.latitude ?? 0, specimen?.origin?.longitude ?? 0]">
            <LeafletMarker
              v-if="specimen?.origin"
              :name="specimen?.name"
              :center="[specimen?.origin.latitude, specimen?.origin.longitude]"
            />
          </LeafletMap>
        </section>
        <section class="ml-64">
          <h2 class="text-primary-40 mb-3 text-lg font-bold uppercase">
            Publications
          </h2>
          <PvEntityList class="list-inside list-decimal" :entities="specimen?.publications" :label="p => p.citation" item-class="my-3 first:mt-0 last:mb-0" />
        </section>
      </div>
      <div class="w-1/3">
        <PvEntityDetails :entity="specimen!" :fields="['classifications', `date`, `age`, `composition`, `pieces`, `measurements`, `storage`, [`collector`, `Collector's Name`], [`sponsor`, `Sponsor's Name`]]" item-class="my-6 first:mt-0 last:mb-0" label-class="text-primary-40 uppercase">
          <template #classifications>
            {{ classificationLabels }}
          </template>
          <template #age="{ value: age }">
            {{ age.numeric ? age.numeric : `${age.relative.boundaries.lower} - ${age.relative.boundaries.upper}` }} Ma ({{ age.relative.label }})
          </template>
          <template #pieces>
            {{ specimen?.pieces }}{{ specimen?.partial ? ` (P)` : `` }}
          </template>
          <template #measurements>
            <ul v-for="dimensions in specimen?.measurements" :key="dimensions">
              <li>{{ dimensions.width }}mm x {{ dimensions.length }}mm</li>
            </ul>
          </template>
          <template #storage>
            {{ specimen?.storage.at(-1)?.location.public ? `On Display` : `In Archive` }}
          </template>
          <template #collector>
            {{ specimen?.collector?.firstName }} {{ specimen?.collector?.lastName }}
          </template>
          <template #sponsor>
            {{ specimen?.sponsor?.firstName }} {{ specimen?.sponsor?.lastName }}
          </template>
        </PvEntityDetails>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { type Specimen } from 'types/specimen'

definePageMeta({
  layout: `default`,
})

const { slug } = useRoute().params
const { data: specimen, error } = await useFetch<Specimen>(`/api/specimens/${slug}`)
if (error.value) {
  showError({ statusCode: 404 })
}

const classificationLabels = computed(() => specimen.value?.classifications.map(c => c.label).join(`, `))
</script>
