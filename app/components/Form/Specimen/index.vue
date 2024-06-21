<template>
  <EntityForm @save="onSave" @cancel="$emit(`cancel`)">
    <TwFormField label="Object IDs">
      <InputSpecimenObjectID v-model="data.objectIDs" />
    </TwFormField>
    <TwFormField label="Collection">
      <InputSpecimenCollection v-model="data.collection" />
    </TwFormField>
    <TwFormField label="Date added">
      <TwInputText v-model="data.date" placeholder="e.g. 1974, 1974-08, or 1974-08-12" class="input input-text-lg" />
    </TwFormField>
    <TwFormField label="Description">
      <TwInputTextArea v-model="data.description" :rows="5" class="input input-textarea-lg" />
    </TwFormField>
    <TwFormField label="Images">
      <TwInputImage v-model="data.images" :options="imageOptions" class="w-full" @drop="files => onNewFiles(files)" />
    </TwFormField>
    <TwFormField label="Publications">
      <InputDoi v-model="doiSearch" placeholder="Search by DOI, e.g. https://doi.org/10.1130/GES01535.1" @resolve="onResolveDoi">
        <template #before>
          <div v-for="(publication, id) of data.publications" :key="id" class="hover:bg-accent-light text-nowrap bg-accent-mid inline-flex cursor-pointer space-x-2 rounded-md px-1.5 text-sm leading-6" @click="openPublicationFormModal({ publication })">
            {{ id }}
            <button @click.prevent.stop="onRemovePublication(id as string)">
              <IconCancel class="fill-accent-dark hover:stroke-base hover:fill-red stroke-accent-light h-4 w-4 stroke-2" />
            </button>
          </div>
        </template>
      </InputDoi>
    </TwFormField>
    <TwFormField label="Trade value">
      <TwInputNumber v-model="data.market" :min="0" class="input input-number-lg" />
    </TwFormField>
  </EntityForm>
</template>

<script setup lang="tsx">
import { type Image, FilterOperator } from '@unb-libraries/nuxt-layer-entity'
import { type Specimen, type Publication } from 'types/specimen'
import { FormPublication } from '#components'
import useEntityFormModal from '~/layers/primevue/composables/useEntityFormModal'

const props = defineProps<{
  specimen: Specimen
}>()

const emits = defineEmits<{
  save: [specimen: Specimen]
  cancel: []
}>()

const { open: openPublicationFormModal } = useEntityFormModal(FormPublication, {
  onSave: (publication: Publication) => { data.publications[publication.id] = publication },
})

const doiSearch = ref<string>()
function onResolveDoi({ citation, abstract, doi }: Publication) {
  const cindex = citation.indexOf(`,`)
  const id = citation.substring(0, cindex > 0 ? cindex : 10).trim()
  openPublicationFormModal({ publication: { id, doi, citation, abstract } })
  doiSearch.value = undefined
}

const data = reactive({
  objectIDs: (props.specimen.objectIDs ?? []),
  collection: props.specimen.collection?.self,
  date: props.specimen.date ?? ``,
  description: props.specimen.description ?? ``,
  images: Object.fromEntries((props.specimen.images?.entities ?? []).map(({ self, uri }) => [self, uri])),
  publications: Object.fromEntries((props.specimen.publications ?? []).map(p => [p.id, p])),
  market: props.specimen.market,
  externalID: ``,
})

const { entities: images, refresh } = await fetchEntityList<Image>(`File`, { filter: [[`type`, FilterOperator.EQUALS, `image`]], select: [`uri`], pageSize: 500 })
const imageOptions = computed(() => images.value
  .map(({ self, uri }) => ({ [self]: uri }))
  .reduce((acc, cur) => ({ ...acc, ...cur }), {}))

async function onNewFiles(files: File[]) {
  files.length > 1
    ? await useFileUpload<Image>(files)
    : await useFileUpload<Image>(files[0])
  refresh()
}

function onRemovePublication(id: string) {
  delete data.publications[id]
}

const onSave = () => {
  const { objectIDs, collection, date, description, images, publications, market } = data
  const payload = {
    objectIDs: objectIDs.length ? data.objectIDs : props.specimen.objectIDs ? null : undefined,
    collection: collection ?? (props.specimen.collection ? null : undefined),
    date: date || (props.specimen.date ? null : undefined),
    description: description || (props.specimen.description ? null : undefined),
    images: Object.keys(images),
    publications: Object.values(publications),
    market: market || (props.specimen.market ? null : undefined),
  }
  emits(`save`, payload)
}
</script>
