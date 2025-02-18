<template>
  <article class="container mx-auto flex flex-col space-y-6 pb-24 pt-12">
    <header class="ml-32">
      <h1 class="text-2xl font-bold">
        {{ specimen?.name }}
      </h1>
      <span class="-mt-1 block text-sm italic">#{{ specimen!.id.toUpperCase() }}</span>
    </header>
    <div class="flex flex-row space-x-8">
      <div class="flex w-2/3 flex-col space-y-12">
        <section>
          <div v-if="(specimen?.images?.total ?? 0) > 0" class="space-y-1">
            <img :src="`${activeImage?.[1]}?w=1024&h=731`" />
            <div class="w-full h-24 inline-flex gap-x-1 overflow-x-scroll">
              <img v-for="{ self, uri } in specimen?.images?.entities" :key="self" :src="`${uri}?w=100&h=100`" :class="['cursor-pointer hover:opacity-50 size-24', { 'opacity-50': self === activeImage?.[0] }]" @click="activeImage = [self, uri]" />
            </div>
          </div>
          <div v-else class="bg-primary-20 dark:bg-primary-60 aspect-7/5 w-full text-base dark:text-primary-40 justify-center items-center flex">
            <IconFossil v-if="specimen!.type === 'fossil'" class="size-48 fill-none stroke-current stroke-1.5" />
            <IconMineral v-else-if="specimen!.type === 'mineral'" class="size-48 fill-none stroke-current stroke-1.5" />
            <IconRock v-else class="size-48 fill-none stroke-current stroke-1.5" />
          </div>
        </section>
        <section v-if="specimen?.description" class="ml-64 text-justify">
          {{ specimen?.description }}
        </section>
        <section v-if="specimen?.origin" class="ml-64 w-full">
          <h2 class="text-primary-40 mb-3 text-lg font-bold uppercase">
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
        <section v-if="(specimen?.publications ?? []).length > 0" class="ml-64">
          <h2 class="text-primary-40 mb-3 text-lg font-bold uppercase">
            Publications
          </h2>
          <!-- <PvEntityList class="list-inside list-decimal" :entities="specimen!.publications" :label="p => p.citation" item-class="my-3 first:mt-0 last:mb-0" /> -->
        </section>
      </div>
      <div class="w-1/3">
        <PvEntityDetails :entity="specimen!" :fields="[['type', 'Category'], 'classification', `date`, `age`, `composition`, `pieces`, `measurements`, `storage`]" item-class="my-6 first:mt-0 last:mb-0" label-class="text-primary-40 uppercase">
          <template #type>{{ specimen!.type[0].toUpperCase() + specimen!.type.slice(1).toLowerCase() }}</template>
          <template #classification>
            {{ classificationLabels.join(' > ') }}
          </template>
          <template #date>{{ specimen!.date ?? 'Unknown' }}</template>
          <template #composition>
            <template v-if="specimen!.type !== 'mineral'">{{(specimen! as Fossil | Rock).composition?.entities.map(({ label }) => label).join(`, `)}}</template>
            <!-- FIX: Composition is not included in Mineral classification -->
            <template v-else-if="(specimen!.classification as Mineral)?.composition">{{ (specimen!.classification as Mineral) }}</template>
            <template v-else>Unknown</template>
          </template>
          <template #age>
            <template v-if="specimen?.age?.relative">
              {{specimen?.age?.relative?.map(({ label, start }, i) => `${label} (${Number(specimen!.age.numeric?.[i] ?? start) / 1000000} Mya)`).join(' - ')}}
            </template>
            <template v-else>Unknown</template>
          </template>
          <template #pieces>
            {{ specimen?.pieces }}{{ specimen?.partial ? ` (Partial)` : `` }}
          </template>
          <template #measurements>
            <ul v-for="dimensions in specimen!.measurements?.dimensions" :key="dimensions.join('x')">
              <li>{{dimensions.map(d => `${d}mm`).join(' x ')}}</li>
            </ul>
          </template>
          <template #storage>
            {{ specimen?.storage.at(-1)?.location.public ? `On Display` : `In Archive` }}
          </template>
        </PvEntityDetails>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { type Fossil, type Rock, type Specimen } from 'types/specimen'
import type { Mineral } from 'types/classification'

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

const activeImage = ref(specimen?.value?.images?.entities?.length ? [specimen!.value?.images?.entities[0].self, specimen!.value?.images?.entities[0].uri] : undefined)
</script>
