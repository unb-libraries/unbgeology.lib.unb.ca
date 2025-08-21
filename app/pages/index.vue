<template>
  <div class="flex flex-col gap-y-40 mb-40">
    <!-- Hero -->
    <section class="flex flex-col w-full justify-center">
      <h1 class="sr-only text-4xl">UNB Earth Science Collections</h1>
      <div class="relative h-[750px] w-full">
        <HeroImages />
        <form action="/specimens" method="GET" class="absolute bottom-1/3 left-1/6 flex flex-row w-2/3 justify-center space-x-2 space-y-0">
          <InputSearch />
          <button
            type="submit"
            class="flex-none text-xl text-base-97 dark:text-base-7 dark:hover:text-base-7 px-4 py-2 rounded-md bg-base-27 dark:bg-base-77 hover:bg-accent-26 dark:hover:bg-accent-36 focus-visible:bg-accent-26 dark:focus-visible:bg-accent-36 dark:focus-visible:text-base-97"
          >
            Search
          </button>
        </form>
      </div>
    </section>
    
    <!-- Browse by Category -->
    <section class="flex flex-col container mx-auto">
      <h2 class="text-4xl mb-12">Browse by Category</h2>
      <div class="grid grid-cols-3 gap-x-12">
        <article v-for="category in ['fossil', 'mineral', 'rock']" class="flex flex-col gap-y-6 h-full">
          <SpecimenImage
            :category="(category as 'fossil' | 'mineral' | 'rock')"
            :url="`/top-cat-images-${category}s.jpg`"
            width="525"
            height="375"
            class="flex-none w-full aspect-7/5"
          />
          <h2 class="flex-none text-2xl">{{ category.charAt(0).toUpperCase() + category.slice(1) }}s</h2>
          <div class="flex flex-col grow">
            <div v-if="category === 'fossil'" class="grow">
              <p>Fossils are the preserved remains or traces of ancient organisms that provide valuable insights into Earth's past life forms and environments. They are the key to understanding the history of life on our planet.</p>
              <p>Studying fossils is a multidisciplinary endeavor that combines geology, paleontology, biology, and other scientific disciplines. It helps us unravel the story of life on Earth and provides a fascinating glimpse into the ancient past.</p>
            </div>
            <div v-if="category === 'mineral'" class="grow">
              <p>Minerals are naturally occurring, inorganic solid substances with a specific chemical composition and a characteristic crystal structure. They are the building blocks of rocks and are found in various geological environments.</p>
              <p>Studying minerals provides insights into Earth's geological processes, as well as their importance in industries and everyday life.</p>
            </div>
            <div v-if="category === 'rock'" class="grow">
              <p>Rocks are solid, naturally occurring substances that make up the Earth's crust. They are composed of minerals, which are the building blocks of rocks. Geologists study rocks to understand Earth's history, the processes that shape the planet's surface, and the resources they may contain.</p>
              <p>It's important to note that rocks vary greatly in their properties, appearance, and composition depending on their specific type and the geological processes that formed them.</p>
            </div>
            <a :href="`/browse/${category}`" class="flex-none text-accent-26 hover:text-accent-46 dark:text-accent-36 text-lg font-semibold underline border-none rounded-md">Browse {{ category.charAt(0).toUpperCase() + category.slice(1) }}s</a>
          </div>
        </article>
      </div>
    </section>

    <!-- Browse by Origin -->
    <section class="flex flex-col container mx-auto">
      <h2 class="text-4xl mb-12">Browse by Origin</h2>
      <LeafletMap :center="mapCenter" :zoom="7" :max-zoom="18" class="z-0 h-[calc(100dvh-15.5rem-2px)]" @drag="onDragMap" @zoom="onZoomMap">
        <LeafletMarkerCluster>
          <LeafletMarker v-for="{ id, self, type, name, classification, images, origin: { name: originName, latitude, longitude } } in markers" :key="self"
            :center="[latitude, longitude]"
            :name="name"
            :accuracy="0"
            :draggable="false"
            >
            <div class="inline-flex gap-2">
              <div class="h-20 aspect-square bg-primary-40 dark:bg-primary-20 flex justify-center items-center">
                <img v-if="images?.total > 0" :src="`${images?.entities[0].uri}?w=100&h=100`" class="aspect-square object-cover">
                <IconFossil v-else-if="type === 'fossil'" class="size-16 stroke-base dark:stroke-primary-40 fill-none" />
                <IconRock v-else-if="type === 'rock'" class="size-16 stroke-base dark:stroke-primary-40 fill-none" />
                <IconMineral v-else-if="type === 'mineral'" class="size-16 stroke-base dark:stroke-primary-40 fill-none" />
              </div>
              <div class="flex flex-col">
                <a :href="`/specimens/${id}`" class="hover:underline text-lg">{{ name ?? 'Unknown' }}</a>
                <span>{{ type[0].toUpperCase() + type.slice(1).toLowerCase() }}</span>
                <span>{{ classification.label }}</span>
                <span>{{ originName }}</span>
              </div>
            </div>
          </LeafletMarker>
        </LeafletMarkerCluster>
      </LeafletMap>
    </section>
  </div>
</template>

<script lang="ts" setup>
import type { EntityJSONList } from '@unb-libraries/nuxt-layer-entity'
import type { Coordinate } from '~/types/leaflet'
import type { Specimen } from '~/types/specimen'

const mapCenter = ref<Coordinate>([46.65848709787655, -66.35685870803573]) // Initially center on NB
const { data: specimens } = await useFetch<EntityJSONList<Specimen>>('/api/specimens', {
  query: {
    filter: ['origin:greater:90.1;180.1', 'origin:less:-90.1;-180.1'],
    select: ['id', 'name', 'images', 'type', 'classification', 'origin'],
  }
})

const markers = computed(() => specimens.value?.entities.filter(({ origin }) => origin?.latitude && origin?.longitude))

function onUpdateCenter(center: Coordinate) {
  mapCenter.value = center
}

function onDragMap(center: Coordinate, bounds: [Coordinate, Coordinate]) {
  onUpdateCenter(center)
}

function onZoomMap(level: number, center: Coordinate, bounds: [Coordinate, Coordinate]) {
  onUpdateCenter(center)
}
</script>
