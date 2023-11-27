<template>
  <LeafletMap
    v-if="markers.length"
    class="mb-12 h-96 rounded-lg"
    :center="[markers[0].latitude, markers[0].longitude]"
  >
    <LeafletMarker
      v-for="marker in markers"
      :key="marker.self"
      :name="marker.name"
      :center="[marker.latitude, marker.longitude]"
      :accuracy="marker.accuracy"
    />
  </LeafletMap>

  <PvEntityList :entities="specimens" item-class="my-4 first:mt-0 last:mb-0 border border-primary-60 p-2 rounded-lg">
    <template #default="{ entity: specimen }">
      <article class="flex flex-row space-x-2">
        <div class="h-32 w-32 flex-none">
          <nuxt-img
            v-if="specimen.images && specimen.images.length > 0"
            :src="`/image/${specimen.images[0].filename}`"
            format="webp"
            fit="cover"
            width="128"
            height="128"
            class="rounded"
          />
          <div v-else class="bg-primary-60 aspect-square w-full rounded" />
        </div>
        <div class="flex grow flex-col overflow-hidden rounded-md p-1">
          <h2 class="text-accent-mid hover:text-accent-light text-xl">
            <a :href="`/specimens/${specimen.id}`">
              {{ specimen.name }}
            </a>
          </h2>
          <div class="grow">
            <PvEntityDetails class="mr-12 flex flex-row justify-between" label-class="font-bold text-primary-40" :entity="specimen" :fields="[`classifications`, `measurements`, `age`, `composition`, [`storage`, `Display`]]">
              <template #classifications="{ value: classifications }">
                <template v-for="(classification, index) in classifications" :key="classification">
                  <span>{{ classification.label }}</span>
                  {{ index < specimen.classifications.length - 1 ? `, ` : `` }}
                </template>
              </template>
              <template #measurements="{ value: measurements }">
                <ul v-for="dimensions in measurements" :key="dimensions">
                  <li>{{ dimensions.width }}mm x {{ dimensions.length }}mm</li>
                </ul>
              </template>
              <template #storage="{ value: storage }">
                {{ storage?.at(-1)?.location.public ? `Public` : `In Archive` }}
              </template>
            </PvEntityDetails>
          </div>
          <div class="flex-none truncate">
            {{ specimen.description }}
          </div>
        </div>
      </article>
    </template>
  </PvEntityList>
</template>

<script setup lang="ts">
import type { Specimen } from "types/specimen"

definePageMeta({
  layout: `page`,
  name: `Specimens`,
})

const { fetchAll } = useEntityType<Specimen>(Symbol(`specimens`))
const { list } = await fetchAll()
const specimens = computed(() => list.value?.entities ?? [])

const markers = computed(() => (specimens.value ?? [])
  .filter(specimen => specimen.origin !== undefined)
  .map(specimen => ({
    self: specimen.self,
    name: specimen.name,
    latitude: specimen.origin!.latitude,
    longitude: specimen.origin!.longitude,
    accuracy: specimen.origin!.accuracy,
  })))

</script>
