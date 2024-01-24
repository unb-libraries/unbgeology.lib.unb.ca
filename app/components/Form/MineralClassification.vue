<template>
  <TaxonomyTermForm :entity="entity">
    <template #default="{ body }">
      <div class="form-field">
        <label for="composition">Composition</label>
        <PvInputText v-model="body.composition" class="form-input form-input-text" name="composition" />
      </div>
    </template>
  </TaxonomyTermForm>
</template>

<script setup lang="ts">
import { type Classification } from '~/types/vocabularies/mineral'

defineProps<{
  entity: Classification
}>()
</script>
