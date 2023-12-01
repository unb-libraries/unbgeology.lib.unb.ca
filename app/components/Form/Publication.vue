<template>
  <EntityForm :entity="publication" @save="publication => emits(`save`, publication)">
    <template #default="{ body }">
      <div class="form-field">
        <label for="citation">DOI</label>
        <FormInputDoiResolve @success="pub => onResolve(pub, body)" @error="msg => doiResolveError = msg ?? ``" />
        <span v-if="doiResolveError" class="text-sm">DOI could not be resolved.</span>
      </div>
      <div class="form-field">
        <label for="citation">Citation</label>
        <PvInputText v-model="body.citation" />
      </div>
      <div class="form-field">
        <label for="abstract">Abstract</label>
        <textarea v-model="body.abstract" rows="5" class="form-input-textarea" />
      </div>
    </template>
    <template #more-actions="{ body }">
      <button class="form-action form-action-delete" @click.prevent="removePublication!(body)">
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
}>()

const removePublication: undefined | ((entity: EntityJSONBody<Publication>) => void) = inject(`remove`)

function onResolve(publication: EntityJSONProperties<Publication>, body: EntityJSONBody<Publication>) {
  if (publication.citation) {
    body.citation = publication.citation.trim()
  }
  if (publication.abstract) {
    body.abstract = publication.abstract.trim()
  }
}

</script>
