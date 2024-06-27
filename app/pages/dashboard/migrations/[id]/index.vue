<template>
  <NuxtLayout name="dashboard-page">
    <template #page-title>
      Edit <span class="italic">"{{ migration!.name }}"</span> migration
    </template>
    <FormMigration :entity="migration!" />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { type Migration } from '@unb-libraries/nuxt-layer-entity'

definePageMeta({
  layout: false,
  name: `Edit migration`,
})

const { id } = useRoute().params

const { fetchByPK } = useEntityType<Migration>(`Migration`)
const { entity: migration } = await fetchByPK(id as string)
if (!migration.value) {
  throw new Error(`Migration not found`)
}
</script>
