<template>
  <EntityForm :entity="data" @save="publication => $emit(`save`, publication as unknown as Publication)" @cancel="$emit(`cancel`)">
    <template #default="{ body }">
      <TwFormField label="ID">
        <TwInputText v-model="body.id" class="input input-text-lg" />
      </TwFormField>
      <TwFormField label="DOI">
        <TwInputText v-model="body.doi" class="input input-text-lg" />
      </TwFormField>
      <TwFormField label="Citation">
        <TwInputTextArea v-model="body.citation" class="input-textarea-lg" />
      </TwFormField>
      <TwFormField label="Abstract">
        <TwInputTextArea v-model="body.abstract" :rows="15" class="input-textarea-lg" />
      </TwFormField>
      <!-- <div class="form-field">
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
      </div> -->
    </template>
    <!-- <template #more-actions>
      <button class="form-action form-action-delete" @click.prevent="emits(`delete`)">
        Delete
      </button>
    </template> -->
  </EntityForm>
</template>

<script setup lang="ts">
import { type Publication } from 'types/specimen'

const props = defineProps<{
  publication?: Publication
}>()

const data = reactive({
  id: ``,
  doi: ``,
  citation: ``,
  abstract: ``,
  ...props.publication,
})

defineEmits<{
  save: [publication: Publication]
  cancel: []
}>()

</script>
