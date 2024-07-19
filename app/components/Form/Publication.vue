<template>
  <EntityForm @save="onSave" @cancel="$emit(`cancel`)">
    <TwFormField label="ID">
      <TwInputText v-model="id" class="input input-text-lg" />
    </TwFormField>
    <TwFormField label="DOI">
      <TwInputText v-model="doi" class="input input-text-lg" />
    </TwFormField>
    <TwFormField label="Citation">
      <TwInputTextArea v-model="citation" :rows="4" class="input-textarea-lg" />
    </TwFormField>
    <TwFormField label="Abstract">
      <TwInputTextArea v-model="abstract" :rows="10" class="input-textarea-lg" />
    </TwFormField>
  </EntityForm>
</template>

<script setup lang="ts">
import { type Publication } from 'types/specimen'

const props = defineProps<{
  publication?: Publication
}>()

const id = ref(props.publication?.id)
const doi = ref(props.publication?.doi)
const citation = ref(props.publication?.citation)
const abstract = ref(props.publication?.abstract)

const emits = defineEmits<{
  save: [publication: Publication]
  cancel: []
}>()

function onSave() {
  emits(`save`, {
    id: id.value || (props.publication?.id ? null : undefined),
    doi: doi.value || (props.publication?.doi ? null : undefined),
    citation: citation.value || (props.publication?.citation ? null : undefined),
    abstract: abstract.value || (props.publication?.abstract ? null : undefined),
  })
}

</script>
