<template>
  <header class="flex flex-row justify-between">
    <h2 class="mb-6 text-2xl">
      Migrations
    </h2>
    <div class="space-x-1">
      <button class="form-action form-action-submit p-2 font-normal" @click.prevent="content = { component: MigrationForm, props: { entity: {} }, eventHandlers: { save: onCreateMigration, cancel: () => closeModal()}}">
        Create
      </button>
    </div>
  </header>
  <PvEntityTable :entities="migrations" :columns="['name', ['total', 'Records'], 'imported', 'skipped', 'errored', 'status', ['actions', '']]">
    <template #name="{ entity: migration }">
      <NuxtLink :to="`/dashboard/migrations/${migration.id}`" class="hover:underline">
        {{ migration.name }}
      </NuxtLink>
    </template>
    <template #status="{ entity: migration }">
      <span v-if="migration.status === MigrationStatus.IDLE">Idle</span>
      <span v-if="migration.status === MigrationStatus.RUNNING">Running</span>
    </template>
  </PvEntityTable>
</template>

<script setup lang="ts">
import { type EntityJSONBody, type Migration, MigrationStatus, type EntityJSON } from "@unb-libraries/nuxt-layer-entity"
import { MigrationForm } from "#components"

definePageMeta({
  layout: `dashboard`,
  name: `Migrations`,
  menu: {
    weight: 2000,
  },
})

const { content, close: closeModal } = useModal()
const { entities: migrations, add: addMigration, update: updateMigration, remove: removeMigration, refresh } = await fetchEntityList<Migration>(`Migration`)
async function onCreateMigration(migration: EntityJSONBody<Migration>) {
  await addMigration(migration)
  closeModal()
}

if (process.client) {
  const idle = computed(() => migrations.value.every(({ status }) => status === MigrationStatus.IDLE))
  let intervalId: ReturnType<typeof setInterval>
  watch(idle, (isIdle) => {
    if (!isIdle) {
      intervalId = setInterval(refresh, 1000)
    } else if (isIdle && intervalId) {
      clearInterval(intervalId)
    }
  }, { immediate: true })
}

function canImport({ status, total, imported, skipped, errored }: EntityJSON<Migration>) {
  return status === MigrationStatus.IDLE && total > imported + skipped + errored
}

function canRollback({ status, imported, skipped, errored }: EntityJSON<Migration>) {
  return status === MigrationStatus.IDLE && imported + skipped + errored > 0
}

function canPause({ status }: EntityJSONBody<Migration>) {
  return status === MigrationStatus.RUNNING
}

async function onImportMigration(migration: EntityJSON<Migration>) {
  await useFetch(`/api/migrations/${migration.id}/items/import`, { method: `POST` })
  refresh()
}

async function onRollbackMigration(migration: EntityJSON<Migration>) {
  await useFetch(`/api/migrations/${migration.id}/items/rollback`, { method: `POST` })
  refresh()
}

async function onPauseMigration(migration: EntityJSON<Migration>) {
  await useFetch(`/api/migrations/${migration.id}/items/pause`, { method: `POST` })
  refresh()
}
</script>
