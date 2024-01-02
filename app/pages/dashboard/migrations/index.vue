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
  <PvEntityTable :entities="migrations" :columns="['name', ['total', 'Records'], 'status', ['actions', '']]">
    <template #actions="{ entity: migration }">
      <PvDefaultEntityTableActions
        :entity="migration"
        label="name"
        :form="MigrationForm"
        :update="updateMigration"
        :remove="removeMigration"
        class="invisible group-hover:visible group-focus:visible"
      />
    </template>
  </PvEntityTable>
</template>

<script setup lang="ts">
import { type EntityJSONBody } from 'layers/base/types/entity'
import { type Migration } from 'layers/base/types/migrate'
import { MigrationForm } from "#components"

definePageMeta({
  layout: `dashboard`,
})

const { content, close: closeModal } = useModal()

const { entities: migrations, add: addMigration, update: updateMigration, remove: removeMigration } = await fetchEntityList<Migration>(`Migration`)
async function onCreateMigration(migration: EntityJSONBody<Migration>) {
  await addMigration(migration)
  closeModal()
}

</script>
