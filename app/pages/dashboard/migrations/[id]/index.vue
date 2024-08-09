<template>
  <NuxtLayout name="dashboard-page">
    <template #page-title>
      Edit <span class="italic">"{{ migration!.name }}"</span>
    </template>
    <div class="space-y-12">
      <nav class="flex flex-row">
        <span class="hover:dark:bg-accent-dark/20 border-accent-mid dark:bg-accent-dark/20 w-1/2 border-b-4 py-4 text-center text-lg">Edit</span>
        <NuxtLink :to="`${$route.path}/items`" class="dark:bg-accent-dark/10 hover:dark:bg-accent-dark/20 w-1/2 py-4 text-center text-lg">
          Items
        </NuxtLink>
      </nav>
      <FormMigration :entity="migration!" @save="onSave" @cancel="navigateTo(`/dashboard/migrations`)" />
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
const { createToast } = useToasts()

const { fetchByPK, update } = useEntityType<Migration>(`Migration`)
const { entity: migration } = await fetchByPK(id as string)
if (!migration.value) {
  throw new Error(`Migration not found`)
}

async function onSave(values: Partial<Pick<Migration, `name` | `entityType` | `dependencies`>>) {
  const { entity: updatedMigration, error } = await update({ self: migration.value?.self, ...values })
  if (updatedMigration.value) {
    createToast(`migration-update-success`, () => `Migration updated`, { type: `success`, duration: 4000 })
    navigateTo(`/dashboard/migrations`)
  } else if (error.value) {
    createToast(`migration-update-error`, () => `${error.value}`, { type: `error`, duration: 4000 })
  }
}
</script>
