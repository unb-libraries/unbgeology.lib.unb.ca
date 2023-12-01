<template>
  <TaxonomyTermForm :term="term" type="storagelocation">
    <template #default="{ body }">
      <div class="form-field">
        <label for="public">Public</label>
        <div name="public" class="form-row">
          <div class="form-input-radio">
            <input id="public-yes" v-model="body.public" type="radio" name="public" value="true">
            <label for="public-yes">Yes</label>
          </div>
          <div class="form-input-radio">
            <input id="public-no" v-model="body.public" type="radio" name="public" value="false">
            <label for="public-no">No</label>
          </div>
        </div>
      </div>
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
