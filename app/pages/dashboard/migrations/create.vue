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
]

async function onSave(body: MigrationBody, items?: MigrationItemBody[]) {
  const { createToast } = useToasts()
  const { entity: migration, error: createError } = await create(body)
  if (!createError.value) {
    if (items?.length) {
      const { error: itemsCreateError } = await useFetch(`${migration.value?.self}/items`, {
        method: `POST`,
        body: items,
      })
      if (itemsCreateError.value) {
        createToast(`migration-items-created-error`, () => `Failed to create migration items: ${itemsCreateError.value}`, { type: `error` })
      } else {
        createToast(`migration-items-created`, () => `Migration created`, { type: `success` })
        navigateTo(returnUrl)
      }
    } else {
      createToast(`migration-created`, () => `Migration created`, { type: `success` })
    }
  } else {
    createToast(`migration-created-error`, () => `Failed to create migration: ${createError.value}`, { type: `error` })
    navigateTo(returnUrl)
  }
}

</script>
