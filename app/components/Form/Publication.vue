<template>
  <EntityForm :entity="publication" @save="publication => emits(`save`, publication)">
    <template #default="{ body }">
      <div class="my-6 flex flex-col">
        <label class="mb-2 w-full text-lg font-bold" for="citation">DOI</label>
        <FormInputDoiResolve @success="pub => onResolve(pub, body)" @error="msg => doiResolveError = msg ?? ``" />
        <span v-if="doiResolveError" class="text-sm">DOI could not be resolved.</span>
      </div>
      <div class="my-6 flex flex-col">
        <label class="mb-2 w-full text-lg font-bold" for="citation">Citation</label>
        <PvInputText v-model="body.citation" />
      </div>
      <div class="my-6 flex flex-col">
        <label class="mb-2 w-full text-lg font-bold" for="abstract">Abstract</label>
        <textarea v-model="body.abstract" rows="5" class="dark:bg-primary border-primary-20 dark:border-primary-60/75 hover:border-accent-light dark:focus:border-accent-mid rounded-lg border p-2" />
      </div>
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

function onResolve(publication: EntityJSONProperties<Publication>, body: EntityJSONBody<Publication>) {
  if (publication.citation) {
    body.citation = publication.citation.trim()
  }
  if (publication.abstract) {
    body.abstract = publication.abstract.trim()
  }
}

</script>
