<template>
  <NuxtLayout name="dashboard-page">
    <template #page-title>
      Edit <span class="italic">"{{ migration!.name }}"</span>
    </template>
    <div class="space-y-12">
      <nav class="flex flex-row">
        <span class="dark:bg-accent-dark/10 hover:dark:bg-accent-dark/20 border-accent-mid dark:bg-accent-dark/20 w-1/2 border-b-4 py-4 text-center text-lg">Edit</span>
        <NuxtLink :to="`${$route.path}/items`" class="dark:bg-accent-dark/10 hover:dark:bg-accent-dark/20 w-1/2 py-4 text-center text-lg">
          Items
        </NuxtLink>
      </nav>
      <FormMigration :entity="migration!" />
    </div>
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
