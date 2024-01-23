<template>
  <h1 class="mb-12 text-2xl">
    {{ migration?.name }}
  </h1>

  <h2 class="mb-6 text-xl">
    Imported
  </h2>
  <PvEntityTable :entities="imported" :columns="[`sourceID`, `entityURI`]" />

  <h2 class="mb-6 text-xl">
    Errored
  </h2>
  <PvEntityTable :entities="errored" :columns="[`sourceID`, `error`]" />
</template>

<script setup lang="ts">
import { MigrationStatus, type Migration, type MigrationItem } from '@unb-libraries/nuxt-layer-entity'

definePageMeta({
  layout: `dashboard`,
})

const { id } = useRoute().params

const { fetchByPK } = useEntityType<Migration>(`Migration`)
const { entity: migration } = await fetchByPK(id as string)
const { entities: items } = await fetchEntityList<MigrationItem>(`${migration.value!.self}/items`)

const imported = computed(() => items.value.filter(item => item.status === MigrationStatus.IMPORTED))
const errored = computed(() => items.value.filter(item => item.status === MigrationStatus.ERRORED))
</script>
