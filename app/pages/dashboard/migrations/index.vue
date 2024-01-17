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
    <template #status="{ entity: migration }">
      <span v-if="migration.status === MigrationStatus.IDLE">Idle</span>
      <span v-if="migration.status === MigrationStatus.RUNNING">Running</span>
    </template>
    <template #actions="{ entity: migration }">
      <PvDefaultEntityTableActions
        :entity="migration"
        label="name"
        :form="MigrationForm"
        :update="updateMigration"
        :remove="removeMigration"
        class="invisible group-hover:visible group-focus:visible"
      >
        <template #before>
          <button v-if="canImport(migration)" class="bg-accent-mid hover:bg-accent-light rounded-md px-2 py-1 hover:cursor-pointer" @click.prevent="onImportMigration(migration)">
            Import
          </button>
          <button v-if="canRollback(migration)" class="bg-blue hover:bg-blue-light rounded-md px-2 py-1 hover:cursor-pointer" @click.prevent="onRollbackMigration(migration)">
            Rollback
          </button>
          <button v-if="canPause(migration)" class="bg-yellow hover:bg-yellow-light rounded-md px-2 py-1 hover:cursor-pointer" @click.prevent="onPauseMigration(migration)">
            Pause
          </button>
        </template>
      </PvDefaultEntityTableActions>
    </template>
  </PvEntityTable>
</template>

<script setup lang="ts">
import { type EntityJSONBody, type Migration, MigrationStatus, type EntityJSON } from "@unb-libraries/nuxt-layer-entity"
import { MigrationForm, PvDefaultEntityTableActions } from "#components"

definePageMeta({
  layout: `dashboard`,
})

const { content, close: closeModal } = useModal()
const { entities: migrations, add: addMigration, update: updateMigration, remove: removeMigration, refresh } = await fetchEntityList<Migration>(`Migration`)
async function onCreateMigration(migration: EntityJSONBody<Migration>) {
  await addMigration(migration)
  closeModal()
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
  await useFetch(`/api/migrations/${migration.id}/import`, { method: `POST` })
  refresh()
}

async function onRollbackMigration(migration: EntityJSON<Migration>) {
  await useFetch(`/api/migrations/${migration.id}/rollback`, { method: `POST` })
  refresh()
}

async function onPauseMigration(migration: EntityJSON<Migration>) {
  await useFetch(`/api/migrations/${migration.id}/pause`, { method: `POST` })
  refresh()
}
</script>
