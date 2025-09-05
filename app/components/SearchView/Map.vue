<template>
  <SpecimenMap :specimens="specimens" :pending="pending" class="relative z-0 h-[calc(100dvh-15.5rem-2px)]" />
</template>

<script lang="ts" setup>
import type { EntityJSONList } from '@unb-libraries/nuxt-layer-entity'
import { type Specimen } from '~/types/specimen'

import { useRouteQuery } from '@vueuse/router'

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
</script>
