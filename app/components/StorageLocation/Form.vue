<template>
  <TaxonomyTermForm :entity="entity" type="storagelocation">
    <template #default="{ body }">
      <PvCheckbox id="public" v-model="body.public" name="public" label="Public" />
    </template>
  </TaxonomyTermForm>
</template>

<script setup lang="ts">
import { type StorageLocation } from "types/taxonomy"
import type { Entity, EntityJSON, EntityJSONProperties } from "layers/base/types/entity"

defineProps<{
  entity: EntityJSONProperties<StorageLocation> & Partial<EntityJSON<Entity>>
}>()
</script>
