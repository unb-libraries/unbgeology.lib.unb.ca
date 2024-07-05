<template>
  <FormMigration :entity-type-options="entityTypeOptions" @save="onSave" @cancel="navigateTo(returnUrl)" />
</template>

<script setup lang="ts">
import { type Migration, type MigrationItem } from "@unb-libraries/nuxt-layer-entity"

definePageMeta({
  name: `Add migration`,
  layout: `dashboard-page`,
  auth: {
    redirect: true,
    permission: /^create:migration/,
  },
  menu: {
    weight: 0,
  },
})

type MigrationBody = Pick<Migration, `name` | `entityType` | `dependencies`>
type MigrationItemBody = Pick<MigrationItem, `sourceID` | `data`>
const { create } = useEntityType<Migration, MigrationBody>(`Migration`)
const returnUrl = `/dashboard/migrations`

const entityTypeOptions: [string, string][] = [
  [`Specimen`, `Specimen`],
  [`Term.Classification.Fossil`, `Classification (Fossil)`],
  [`Term.Classification.Mineral`, `Classification (Mineral)`],
  [`Term.Classification.Rock`, `Classification (Rock)`],
  [`Term.Composition`, `Composition`],
  [`Term.Geochronology`, `Geochronology`],
  [`Term.StorageLocation`, `Storage location`],
  [`Term.Affiliate`, `Collector / Sponsor`],
  [`User`, `User`],
]

async function onSave(body: MigrationBody) {
  const { createToast } = useToasts()
  const { error } = await create(body)
  if (!error.value) {
    createToast(`migration-created`, () => `Migration created`, { type: `success` })
    navigateTo(returnUrl)
  } else {
    createToast(`migration-created-error`, () => `Failed to create migration: ${error.value}`, { type: `error` })
  }
}

</script>
