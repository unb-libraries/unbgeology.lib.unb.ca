<template>
  <EntityForm :entity="entity">
    <template #default="{ body }">
      <div class="form-field">
        <label for="name">Name</label>
        <PvInputText id="form-input-label" v-model="body.name" class="form-input form-input-text" name="name" />
      </div>
      <div class="form-field">
        <label for="type">Type</label>
        <PvInputSelect
          id="form-select-parent"
          v-model="body.entityType"
          class="form-input form-input-pvselect"
          name="type"
          :options="entityTypes"
        />
      </div>
      <div class="form-field">
        <label for="source">Source</label>
        <EntityInputSelect
          id="form-select-parent"
          v-model="body.source"
          class="form-input form-input-pvselect"
          name="parent"
          :options="files"
          option-label="filename"
        />
      </div>
    </template>
  </EntityForm>
</template>

<script setup lang="ts">
import { type EntityJSON, type EntityJSONProperties } from 'layers/base/types/entity'
import { type Migration } from 'layers/base/types/migrate'

defineProps<{
  entity: EntityJSONProperties<Migration> & Partial<EntityJSON<Migration>>
}>()

// TODO: filter json,csv files
const { entities: files } = await fetchEntityList(`File`)
const entityTypes = Object.keys(useAppConfig().entityTypes)
</script>
