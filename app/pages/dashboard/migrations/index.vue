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
            <button v-if="hasPermission(/^update:migrationitem/)" class="button button-lg button-outline-accent-mid hover:button-accent-mid w-full" @click.stop.prevent="onClickUpdate">
              Update
            </button>
            <button v-if="hasPermission(/^update:migrationitem/)" class="button button-lg button-outline-red hover:button-red w-full" @click.stop.prevent="onClickRollback">
              Rollback
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
import { type Migration, MigrationStatus, type EntityJSON } from "@unb-libraries/nuxt-layer-entity"
import { PvConfirm, PvEntityDeleteConfirm } from "#components"

definePageMeta({
  layout: false,
  name: `Migrations`,
  menu: {
    weight: 2000,
  },
})

const { hasPermission } = useCurrentUser()
const { setContent, close: closeModal } = useModal()
const { createToast } = useToasts()

const { entities: migrations, list, remove, error, query: { page, pageSize } } = await fetchEntityList<Migration>(`Migration`)
const columns: [keyof Migration, string][] = [[`name`, `Name`], [`total`, `Records`], [`imported`, `Imported`], [`skipped`, `Skipped`], [`errored`, `Errored`], [`status`, `Status`]]
const selection = ref<EntityJSON<Migration>>()

function onClickImport() {
  const onConfirm = () => { useFetch(`/api/migrations/${selection.value!.id}/queues`, { method: `POST`, body: { type: `import` } }); closeModal() }
  setContent(() => <PvConfirm question={`Import "${selection.value!.name}"?`} onConfirm={onConfirm} onCancel={closeModal} />)
}

function onClickUpdate() {
  const onConfirm = () => { useFetch(`/api/migrations/${selection.value!.id}/queues`, { method: `POST`, body: { type: `update` } }); closeModal() }
  setContent(() => <PvConfirm question={`Update "${selection.value!.name}"?`} onConfirm={onConfirm} onCancel={closeModal} />)
}

function onClickRollback() {
  const onConfirm = () => { useFetch(`/api/migrations/${selection.value!.id}/queues`, { method: `POST`, body: { type: `rollback` } }); closeModal() }
  setContent(() => <PvConfirm question={`Rollback "${selection.value!.name}"?`} onConfirm={onConfirm} onCancel={closeModal} />)
}

function onClickRemove() {
  const label = `the migration "${selection.value!.name}"`
  setContent(() => <PvEntityDeleteConfirm label={label} onConfirm={onRemove} onCancel={closeModal} />)
}

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
</script>
