<template>
  <EntityForm :entity="data" submit-label="Save & Add another" @save="onClickSaveAndAdd" @cancel="navigateTo(`/dashboard/specimens`)">
    <TwFormField label="Category">
      <TwInputRadioGroup
        v-model="data.type"
        :options="[[`fossil`, `Fossil`], [`mineral`, `Mineral`], [`rock`, `Rock`]]"
        class="w-full flex-row space-x-3"
        item-class="w-1/3 border border-primary-60/40 hover:border-accent-light rounded-md bg-primary flex flex-row items-center text-primary-60 hover:text-base"
        selected-item-class="!text-base !border-accent-mid"
        input-class="ml-6"
        label-class="w-full pr-6 py-4 h-full"
      >
        <template #label="{ option, label }">
          <div class="flex w-full flex-row items-center justify-between space-x-4">
            <div>{{ label }}</div>
            <IconFossil v-if="option === `fossil`" class="h-12 w-12 stroke-current stroke-1" />
            <IconMineral v-if="option === `mineral`" class="h-12 w-12 stroke-current stroke-1" />
            <IconRock v-if="option === `rock`" class="h-12 w-12 stroke-current stroke-1" />
          </div>
        </template>
      </TwInputRadioGroup>
    </TwFormField>
    <TwFormField label="Legal Status">
      <TwInputRadioGroup v-model="data.legal" :options="useEnum(Legal).toTuples().reverse().map(([value, label]) => [value, sentenceCased(label)])" class="input-radio-group flex-row space-x-3" />
    </TwFormField>
    <TwFormField v-if="data.legal === Legal.LOAN" label="Lender ID">
      <TwInputText v-model="data.lenderID" class="input input-text-lg" />
    </TwFormField>
    <TwFormField v-if="data.type === `fossil`" label="Taxonomy">
      <InputSpecimenClassification v-model="data.classification" :type="data.type" />
    </TwFormField>
    <TwFormField v-if="data.type === `mineral`" label="Mineral type or group">
      <InputSpecimenClassification v-model="data.classification" :type="data.type" />
    </TwFormField>
    <TwFormField v-if="data.type === `rock`" label="Rock type or group">
      <InputSpecimenClassification v-model="data.classification" :type="data.type" />
    </TwFormField>
    <TwFormField label="Object name">
      <TwInputText v-model="data.name" class="input input-text-lg" />
    </TwFormField>
    <TwFormField label="Images">
      <TwInputImage v-model="data.images" :max-files="maxFiles" :max-file-size="maxFileSize" :max-total-file-size="maxTotalFileSize" />
    </TwFormField>
    <TwFormField v-if="unbOwned" label="ObjectIDs">
      <InputSpecimenObjectID v-model="data.objectIDs" />
    </TwFormField>
    <template #more-actions>
      <button type="submit" class="button button-lg button-accent-mid hover:button-accent-light disabled:button-primary-60 disabled:text-primary-20 flex-none disabled:cursor-not-allowed" @click.prevent.stop="onClickSaveAndContinue">
        Save & Continue
      </button>
    </template>
  </EntityForm>
</template>

<script setup lang="tsx">
import { Legal, type Specimen } from 'types/specimen'

definePageMeta({
  layout: `dashboard-page`,
  name: `Create specimen`,
})

const { maxFiles, maxFileSize, maxTotalFileSize } = useRuntimeConfig().public
const unbOwned = ref(true)

const { id } = useCurrentUser()
const { create } = useEntityType<Specimen>(`Specimen`)
const { createToast } = useToasts()

const data = reactive({
  type: undefined,
  legal: Legal.PERMANENT,
  objectIDs: [],
  classification: undefined,
  name: undefined,
  loan: undefined,
  lenderID: undefined,
  images: {} as Record<string, string>,
})

async function save() {
  const { entity: specimen, error } = await create({ ...data, images: Object.keys(data.images), creator: `/api/users/${id.value}` })
  if (specimen.value) {
    createToast(`specimen-create-confirm-${specimen.value.id}`, () => `Specimen created.`, { type: `success` })
    return specimen.value
  } else if (error.value) {
    createToast(`specimen-error`, () => `${error.value}`, { type: `error` })
    return null
  }
}

async function onClickSaveAndAdd() {
  const specimen = await save()
  if (specimen) {
    data.type = undefined
    data.legal = Legal.PERMANENT
    data.objectIDs = []
    data.classification = undefined
    data.name = undefined
    data.loan = undefined
    data.lenderID = undefined
    data.images = {}
    unbOwned.value = true
  }
}

async function onClickSaveAndContinue() {
  const specimen = await save()
  if (specimen) {
    navigateTo(`/dashboard/specimens/${specimen.id}`)
  }
}
</script>
