<template>
  <TermForm :entity="entity">
    <template #default="{ body }">
      <slot name="parent" :body="body">
        <div class="form-field">
          <label for="parent">Parent</label>
          <EntityInputSelect
            id="form-select-parent"
            v-model="body.parent"
            class="form-input form-input-pvselect"
            name="parent"
            :options="parents"
            option-label="label"
          />
        </div>
      </slot>
      <slot :body="body" />
    </template>
  </TermForm>
</template>

<script setup lang="ts" generic="T extends TaxonomyTerm = TaxonomyTerm">
import { type EntityJSON, type EntityJSONProperties, type TaxonomyTerm } from "@unb-libraries/nuxt-layer-entity"

defineProps<{
  entity: EntityJSONProperties<T> & Partial<EntityJSON<T>>
  parents: EntityJSON<T>[]
}>()
</script>
