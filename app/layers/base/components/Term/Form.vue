<template>
  <EntityForm :entity="entity">
    <template #default="{ body }">
      <slot name="label" :body="body">
        <div class="form-field">
          <label for="label">Label</label>
          <PvInputText id="form-input-label" v-model="body.label" class="form-input form-input-text" name="Label" />
        </div>
      </slot>
      <slot :body="body" />
    </template>
  </EntityForm>
</template>

<script setup lang="ts" generic="T extends Term = Term">
import { type EntityJSON, type EntityJSONProperties, type Term } from "@unb-libraries/nuxt-layer-entity"

defineProps<{
  entity: EntityJSONProperties<T> & Partial<EntityJSON<T>>
}>()
</script>
