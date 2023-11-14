<template>
  <TaxonomyTermForm :term="term" type="storagelocation">
    <template #default="{ body }">
      <div class="flex flex-col">
        <label class="mb-2 text-lg font-bold" for="public">Public</label>
        <div name="public" class="flex h-full flex-row items-center">
          <div class="mr-6">
            <input
              id="public-yes"
              v-model="body.public"
              type="radio"
              name="public"
              value="true"
              class="dark:bg-primary border-primary-20 dark:border-primary-60/75 hover:border-accent-light checked:border-accent-mid focus:ring-accent-light/50 focus:ring-offset-base dark:focus:ring-offset-primary h-6 w-6 cursor-pointer appearance-none rounded-full border bg-white align-middle checked:border-8 focus:ring-2 focus:ring-offset-2"
            >
            <label class="mx-3 align-middle" for="public-yes">Yes</label>
          </div>
          <div>
            <input
              id="public-no"
              v-model="body.public"
              type="radio"
              name="public"
              value="false"
              class="dark:bg-primary border-primary-20 dark:border-primary-60/75 hover:border-accent-light checked:border-accent-mid focus:ring-accent-light/50 focus:ring-offset-base dark:focus:ring-offset-primary h-6 w-6 cursor-pointer appearance-none rounded-full border bg-white align-middle checked:border-8 focus:ring-2 focus:ring-offset-2"
            >
            <label class="mx-3 align-middle" for="public-no">No</label>
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
