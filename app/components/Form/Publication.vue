<template>
  <EntityForm :entity="publication" @save="publication => emits(`save`, publication)">
    <template #default="{ body }">
      <div class="form-field">
        <label for="citation">DOI</label>
        <FormInputDoiResolve class="form-input form-input-text" @success="pub => onResolve(pub, body)" @error="msg => doiResolveError = msg ?? ``" />
        <span v-if="doiResolveError" class="text-sm">DOI could not be resolved.</span>
      </div>
      <div class="form-field">
        <label for="citation">Citation</label>
        <PvInputText v-model="body.citation" class="form-input form-input-text" />
      </div>
      <div class="form-field">
        <label for="abstract">Abstract</label>
        <textarea v-model="body.abstract" rows="5" class="form-input form-input-textarea" />
      </div>
    </template>
    <template #more-actions>
      <button class="form-action form-action-delete" @click.prevent="emits(`delete`)">
        Delete
      </button>
    </template>
  </EntityForm>
</template>

<script setup lang="ts">
import { EntityJSONBody, type EntityJSONProperties } from 'layers/base/types/entity'
import { type Publication } from 'types/specimen'

const doiResolveError = ref(``)

defineProps<{
  publication: EntityJSONProperties<Publication>
}>()

const emits = defineEmits<{
  save: [publication: EntityJSONBody<Publication>]
  delete: []
}>()

function onResolve(publication: EntityJSONProperties<Publication>, body: EntityJSONBody<Publication>) {
  if (publication.citation) {
    body.citation = publication.citation.trim()
  }
  if (publication.abstract) {
    body.abstract = publication.abstract.trim()
  }
}

</script>
