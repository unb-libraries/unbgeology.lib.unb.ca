<template>
  <EntityForm @save="onSave" @cancel="$emit(`cancel`)">
    <TwFormField label="Object IDs">
      <InputSpecimenObjectID v-model="data.objectIDs" />
    </TwFormField>
    <TwFormField label="Legal Status">
      <TwInputRadioGroup v-model="data.legal" :options="useEnum(Legal).toTuples().map(([value, label]) => [value, sentenceCased(label)])" class="input-radio-group flex-row space-x-3" />
    </TwFormField>
    <TwFormField v-if="data.legal === Legal.LOAN" label="Lender ID">
      <TwInputText v-model="data.lenderID" class="input input-text-lg" />
    </TwFormField>
    <TwFormField label="Collection">
      <InputSpecimenCollection v-model="data.collection" />
    </TwFormField>
    <TwFormField label="Date added">
      <TwInputText v-model="data.date" placeholder="e.g. 1974, 1974-08, or 1974-08-12" class="input input-text-lg" />
    </TwFormField>
    <TwFormField label="Object name">
      <TwInputText v-model="data.name" class="input input-text-lg" />
    </TwFormField>
    <TwFormField label="Description">
      <TwInputTextArea v-model="data.description" :rows="5" class="input input-textarea-lg" />
    </TwFormField>
    <TwFormField label="Images">
      <TwInputImage v-model="data.images" :max-files="maxFiles" :max-file-size="maxFileSize" :max-total-file-size="maxTotalFileSize" class="w-full" />
    </TwFormField>
    <TwFormField label="Publications">
      <InputSpecimenPublications v-model="data.publications" />
    </TwFormField>
    <TwFormField label="Appraisal">
      <TwInputNumber v-model="data.appraisal" :min="0" class="input input-number-lg" />
    </TwFormField>
  </EntityForm>
</template>

<script setup lang="tsx">
import { type Specimen, Legal } from 'types/specimen'

const props = defineProps<{
  specimen: Specimen
}>()

const emits = defineEmits<{
  save: [specimen: Specimen]
  cancel: []
}>()

const { maxFiles, maxFileSize, maxTotalFileSize } = useRuntimeConfig().public

const data = reactive({
  objectIDs: (props.specimen.objectIDs ?? []),
  legal: (props.specimen.legal && useEnum(Legal).valueOf(props.specimen.legal)) || undefined,
  lenderID: (props.specimen.lenderID),
  collection: props.specimen.collection?.self,
  date: props.specimen.date ?? ``,
  name: props.specimen.name,
  description: props.specimen.description ?? ``,
  images: Object.fromEntries((props.specimen.images?.entities ?? []).map(({ self, uri }) => [self, uri])),
  publications: props.specimen.publications,
  appraisal: props.specimen.appraisal,
  externalID: ``,
})

const onSave = () => {
  const { objectIDs, legal, collection, date, name, description, images, publications, appraisal } = data
  let { lenderID } = data

  if (legal !== Legal.LOAN) {
    lenderID = undefined
  }

  const payload = {
    objectIDs: objectIDs.length ? data.objectIDs : props.specimen.objectIDs ? null : undefined,
    legal: legal || (props.specimen.legal ? null : undefined),
    lenderID: lenderID || (props.specimen.lenderID ? null : undefined),
    collection: collection ?? (props.specimen.collection ? null : undefined),
    date: date || (props.specimen.date ? null : undefined),
    name: name || (props.specimen.name ? null : undefined),
    description: description || (props.specimen.description ? null : undefined),
    images: Object.keys(images),
    publications: (publications?.length && publications) || (props.specimen.publications?.length ? null : undefined),
    appraisal: appraisal || (props.specimen.appraisal ? null : undefined),
  }
  emits(`save`, payload)
}
</script>
