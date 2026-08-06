<template>
  <NuxtLayout name="search" :total :page :pageSize :pending @paginate="page = $event">
    <template #summary><span class="hidden md:inline">Displaying </span>{{ (page - 1) * pageSize + 1 }} - {{ ((page - 1) * pageSize + specimens.length) }} of {{ total }} specimens</template>
    <ul class="overflow-y-hidden size-full">
      <!-- Element container -->
      <li v-for="specimen in specimens" :key="specimen.self" class="group flex w-full h-fit xl:px-4 border border-transparent xl:hover:bg-base-97 xl:dark:hover:bg-accent-6 xl:hover:border-accent-26 xl:dark:hover:border-accent-36">
        <!-- Inner container-->
        <div class="inner flex gap-x-4 border-t border-t-base-77 dark:border-t-base-27 group-first:border-t-transparent xl:group-hover:border-t-transparent w-full py-4">
          <SpecimenImage :category="specimen.type" :url="specimen.images?.entities?.[0]?.uri" width="100" height="100" class="aspect-square h-24" />
          <div class="flex flex-col overflow-hidden gap-y-2">
            <div class="inline-flex gap-x-1 items-center text-base-27 dark:text-base-67 text-xs uppercase font-semibold leading-none">
              <span class="sr-only">ID</span>
              <span>{{ specimen.id.toUpperCase() }}</span>
            </div>
            <h2 class="flex items-center gap-x-1">
              <a :href="`/specimens/${specimen.id}`" class="text-xl text-base-17 dark:text-base-87 hover:text-accent-26 dark:hover:text-accent-36 leading-none border-b border-current">{{ specimen.name ?? 'Unknown' }}</a>
              <IconLock v-if="useEnum(Status).valueOf(specimen.status) !== Status.PUBLISHED" title="Unpublished" class="text-red dark:text-red-light stroke-2 size-4" />
              <SpecimenEditLink :specimen class="hidden group-hover:inline-flex" />
            </h2>
            <TruncatedText v-if="specimen.description">
              {{ specimen.description }}
            </TruncatedText>
            <div class="flex flex-col xl:flex-row gap-y-2 xl:gap-x-6 text-xs text-base-27 dark:text-base-67 uppercase font-semibold leading-none">
              <div class="inline-flex gap-x-1 leading-none items-center">
                <SpecimenIcon :category="specimen.type" class="size-4" />
                <span class="sr-only">Classification</span>
                <span>
                  {{ [specimen.type[0].toUpperCase() + specimen.type.slice(1).toLowerCase(), specimen.classification?.label].filter(Boolean).join(' / ') }}
                </span>
              </div>
              <div class="inline-flex gap-x-1 leading-none items-center">
                <IconMapPin class="size-4 fill-none stroke-current stroke-2" />
                <span class="sr-only">Origin</span>
                <span>{{ specimen.origin?.name }}</span>
              </div>
              <div v-if="specimen.age?.relative?.length" class="inline-flex gap-x-1 leading-none items-center">
                <IconAsterisk class="size-4 fill-none stroke-current stroke-2" />
                <span class="sr-only">Geological age</span>
                <span v-if="specimen.age.relative.length === 1">{{ specimen.age.relative[0].label }}</span>
                <span v-else>{{specimen.age.relative.map(({ label }) => label).join(' to ')}}</span>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import { type EntityJSONList } from '@unb-libraries/nuxt-layer-entity'
import { type Specimen, Status } from '~~/types/specimen'

const search = useRouteQuery('search', '')
const filter = useRouteQuery('filter', [] as string | string[], {
  transform: (filter) => Array.isArray(filter) ? filter : [filter].filter(Boolean)
})
const page = useRouteQuery('page', '1', { transform: Number })

const pageSize = 20
const { data, pending } = await useFetch<EntityJSONList<Specimen>>('/api/specimens', {
  query: {
    search,
    select: ['id', 'name', 'description', 'images', 'type', 'classification', 'age', 'origin', 'status'],
    filter,
    page,
    pageSize,
  }
})

const specimens = computed(() => data.value?.entities ?? [])
const total = computed(() => data.value?.total ?? 0)
</script>

<style>
@media (min-width: 1280px) {
  li.group:hover+li .inner {
    border-top-color: transparent !important;
  }
}
</style>