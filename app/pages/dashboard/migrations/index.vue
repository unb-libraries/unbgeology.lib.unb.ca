<template>
  <NuxtLayout name="dashboard-page">
    <template #actions>
      <NuxtLink v-if="hasPermission(/^create:migration/)" to="/dashboard/migrations/create" class="button button-lg button-accent-mid hover:button-accent-light">
        Add migration
      </NuxtLink>
    </template>

    <EntityTable
      v-model="selection"
      :entities="migrations"
      :columns="['name', ['total', 'Records'], 'imported', 'skipped', 'errored', 'status', ['actions', '']]"
      class="border-primary-60/75 w-full border-b"
      header-cell-class="group"
      row-class="table-row"
      selected-row-class="active"
    >
      <template #name="{ entity: migration }">
        <NuxtLink :to="`/dashboard/migrations/${migration.id}`" class="hover:underline">
          {{ migration.name }}
        </NuxtLink>
      </template>
      <template #status="{ entity: migration }">
        <span v-if="migration.status === MigrationStatus.IDLE">Idle</span>
        <span v-if="migration.status === MigrationStatus.RUNNING">Running</span>
      </template>
    </EntityTable>
    <div class="flex w-full flex-row justify-between px-4">
      <span v-if="list?.total" class="italic">
        {{ (page - 1) * pageSize + 1 }} - {{ Math.min(list?.total ?? 0, page * pageSize) }} of {{ pluralize(list?.total ?? 0, `unit`, `units`) }}
      </span>
      <TwPageIndex :page="page" :total="Math.ceil((list?.total ?? 0) / pageSize)" :size="5" @change="(index) => { page = index }" />
    </div>

    <template #sidebar>
      <EntityAdminSidebar v-if="selection" :entities="[selection]">
        <PvEntityDetails :entity="selection" :fields="columns" class="space-y-4" label-class="font-bold italic" />
        <template #actions>
          <div class="space-y-2">
            <button v-if="hasPermission(/^update:migrationitem/)" class="button button-lg button-outline-blue hover:button-blue w-full" @click.stop.prevent="onClickImport">
              Import
            </button>
            <button v-if="hasPermission(/^delete:migration/)" class="button button-lg button-outline-red-dark hover:button-red-dark w-full" @click.stop.prevent="onClickRemove">
              Delete
            </button>
          </div>
        </template>
      </EntityAdminSidebar>
    </template>
  </NuxtLayout>
</template>

<script setup lang="tsx">
import { type EntityJSONBody, type Migration, MigrationStatus, type EntityJSON } from "@unb-libraries/nuxt-layer-entity"
import { PvEntityDeleteConfirm } from "#components"

definePageMeta({
  layout: false,
  name: `Migrations`,
  menu: {
    weight: 2000,
  },
})

const { hasPermission } = useCurrentUser()
const { setContent, close: closeModal } = useModal()
const { entities: migrations, list, remove, refresh, error, query: { page, pageSize } } = await fetchEntityList<Migration>(`Migration`)
const columns: [keyof Migration, string][] = [[`name`, `Name`], [`total`, `Records`], [`imported`, `Imported`], [`skipped`, `Skipped`], [`errored`, `Errored`], [`status`, `Status`]]
const selection = ref<EntityJSON<Migration>>()

function onClickRemove() {
  const label = `the migration "${selection.value!.name}"`
  setContent(() => <PvEntityDeleteConfirm label={label} onConfirm={onRemove} onCancel={closeModal} />)
}

const { createToast } = useToasts()
async function onRemove() {
  const name = selection.value!.name
  await remove(selection.value!)
  if (error.value) {
    createToast(`migration-delete-error`, () => error.value, { type: `error` })
  } else {
    createToast(`migration-delete-success`, () => `Deleted migration "${name}".`, { type: `success`, duration: 4000 })
  }
  selection.value = undefined
  closeModal()
}

async function onClickImport() {
  const { error } = await useFetch(`/api/migrations/${selection.value!.id}/items/import`, { method: `POST` })
  if (!error.value) {
    createToast(`migration-import-started`, () => `Import started: "${selection.value!.name}"`, { type: `success`, duration: 4000 })
  } else {
    createToast(`migration-import-error`, () => `Failed to import "${selection.value!.name}": ${error.value}`, { type: `error` })
  }
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
