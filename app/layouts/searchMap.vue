<template>
  <NuxtLayout name="search" :total :pending>
    <template #summary>Displaying {{ total }} specimens</template>
    <SpecimenMap :specimens="specimens" :pending="pending" class="relative z-0 h-[calc(100dvh-15.5rem-2px)]" />
  </NuxtLayout>
</template>

<script lang="ts" setup>
import type { EntityJSONList } from '@unb-libraries/nuxt-layer-entity'
import { type Specimen } from '~~/types/specimen'

const search = useRouteQuery('search', '')
const filter = useRouteQuery('filter', [] as string | string[], {
  transform: (filter) => Array.isArray(filter) ? filter : [filter].filter(Boolean)
})

const { data, pending } = await useFetch<EntityJSONList<Specimen>>('/api/specimens/origins', {
  query: {
    search,
    filter,
  }
})
const specimens = computed(() => data.value?.entities ?? [])
const total = computed(() => data.value?.total ?? 0)
</script>
