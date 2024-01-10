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
          v-model="body.entityType"
          class="form-input form-input-pvselect"
          name="type"
          :options="entityTypes"
        />
      </div>
      <div class="form-field">
        <label for="source">Source</label>
        <EntityInputSelect
          v-model="body.source"
          class="form-input form-input-pvselect"
          name="parent"
          :options="files"
          option-label="filename"
        />
      </div>
      <div class="form-field">
        <label for="dependencies">Dependencies</label>
        <EntityInputSelect
          v-model="body.dependencies"
          class="form-input form-input-pvselect"
          :multi="true"
          name="dependencies"
          :options="migrations"
          option-label="name"
        />
      </div>
    </template>
  </EntityForm>
</template>

<script setup lang="ts">
import { type EntityJSON, type EntityJSONProperties, type Migration } from "@unb-libraries/nuxt-layer-entity"

defineProps<{
  entity: EntityJSONProperties<Migration> & Partial<EntityJSON<Migration>>
}>()

// TODO: filter json,csv files
const { entities: files } = await fetchEntityList(`File`)
const entityTypes = Object.keys(useAppConfig().entityTypes)
const { entities: migrations } = await fetchEntityList(`Migration`)
</script>
