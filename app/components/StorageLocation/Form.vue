<template>
  <TaxonomyTermForm :term="term" type="storagelocation">
    <template #default="{ body }">
      <PvCheckbox id="public" v-model="body.public" name="public" label="Public" />
    </template>
  </TaxonomyTermForm>
</template>

<script setup lang="ts">
import { type StorageLocation } from "types/taxonomy"
import type { Entity, EntityJSON, EntityJSONProperties } from "layers/base/types/entity"

defineProps<{
  term: EntityJSONProperties<StorageLocation> & Partial<EntityJSON<Entity>>
}>()
</script>
