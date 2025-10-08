<template>
  <NuxtLayout name="search" :total :page :pageSize :pending @paginate="page = $event">
    <template #summary><span class="hidden md:inline">Displaying </span>{{ (page - 1) * pageSize + 1 }} - {{ ((page - 1) * pageSize + specimens.length) }} of {{ total }} specimens</template>
    <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 size-full">
      <li v-for="specimen in specimens" :key="specimen.self" class="group flex relative overflow-hidden justify-center items-center aspect-square border border-transparent hover:border-accent-26 dark:border-base-27 dark:hover:border-accent-36">
        <SpecimenImageCarousel :specimen />
        <div class="absolute bottom-0 left-0 flex flex-col w-full p-3 bg-base-77/90 dark:bg-base-2/90 group-hover:bg-base-97/95 dark:group-hover:bg-accent-6/95 gap-y-1">
          <h2 class="flex items-center gap-x-1">
            <a :href="`/specimens/${specimen.id}`" :title="specimen.name ?? 'Unknown'" class="leading-none text-lg hover:text-accent-26 dark:hover:text-accent-36 truncate overflow-hidden border-b border-current">{{ specimen.name ?? 'Unknown' }}</a>
            <IconLock v-if="useEnum(Status).valueOf(specimen.status) !== Status.PUBLISHED" title="Unpublished" class="text-red dark:text-red-light stroke-2 size-4" />
            <SpecimenEditLink :specimen class="hidden group-hover:inline-flex" />
          </h2>
          <div class="inline-flex items-center gap-x-1 text-base-27 dark:text-base-67 text-2xl sm:text-lg md:text-md lg:text-sm">
            <SpecimenIcon :category="specimen.type" class="size-4" />
            <span class="sr-only">Classification</span>
            <span class="font-semibold uppercase truncate overflow-hidden">
              {{ [specimen.type[0].toUpperCase() + specimen.type.slice(1), specimen.classification?.label].filter(Boolean).join(' / ') }}
            </span>
          </div>
        </div>
      </li>
    </ul>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import type { EntityJSONList } from '@unb-libraries/nuxt-layer-entity'
import { type Specimen, Status } from '~/types/specimen'
import { useRouteQuery } from '@vueuse/router'

const search = useRouteQuery('search', '')
const filter = useRouteQuery('filter', [] as string | string[], {
  transform: (filter) => Array.isArray(filter) ? filter : [filter].filter(Boolean)
})
const page = useRouteQuery('page', '1', { transform: Number })
const pageSize = 20
const { data, pending } = await useFetch<EntityJSONList<Specimen>>('/api/specimens', {
  query: {
    search,
    select: ['id', 'name', 'images', 'type', 'classification', 'status'],
    filter,
    page,
    pageSize,
  }
})

const specimens = computed(() => data.value?.entities ?? [])
const total = computed(() => data.value?.total ?? 0)
</script>