<template>
  <EntityForm :entity="data">
    <template #default="{ body }">
      <TwFormField label="Object IDs">
        <TwInputText v-model="alias" name="objectID" class="input input-text-lg">
          <template #before>
            <div v-for="(id, type) of body.objectID" :key="type" class="text-nowrap bg-accent-mid inline-flex space-x-1 rounded-md px-1.5 text-sm leading-6" :class="{ 'bg-primary-60': type === `unb`, 'bg-accent-mid': type !== `unb`}">
              {{ `${type !== `unb` ? `${type}:` : ``}${id}` }}
              <button v-if="type !== `unb`" class="hover:text-red text-accent-dark px-1" @click.prevent.stop="onRemoveObjectId(type)">
                x
              </button>
            </div>
          </template>
        </TwInputText>
      </TwFormField>
      <TwFormField label="Collection">
        <PvInputDropdown v-model="body.collection" :options="collections" label-field="label" option-field="self" class="input-select-lg" />
      </TwFormField>
      <TwFormField label="Date added">
        <TwInputText placeholder="e.g. 1974, 1974-08, or 1974-08-12" class="input input-text-lg" />
      </TwFormField>
      <TwFormField label="Description">
        <TwInputTextArea v-model="body.description" :rows="5" class="input input-textarea-lg" />
      </TwFormField>
      <TwFormField label="Images">
        <TwInputImage v-model="body.images" :options="imageOptions" class="w-full" @drop="files => onNewFiles(files)" />
      </TwFormField>
      <TwFormField label="Publications">
        <InputDoi v-model="doiSearch" placeholder="Search by DOI, e.g. https://doi.org/10.1111/j.1600-0536.2011.01936.x" @resolve="onResolveDoi">
          <template #before>
            <div v-for="(publication, id) of body.publications" :key="id" class="hover:bg-accent-light text-nowrap bg-accent-mid inline-flex cursor-pointer space-x-2 rounded-md px-1.5 text-sm leading-6" @click="setContent(PublicationModalForm(publication, { title: `Edit &quot;${id}&quot;`}))">
              {{ id }}
              <button @click.prevent.stop="onRemovePublication(id)">
                <IconCancel class="fill-accent-dark hover:stroke-base hover:fill-red stroke-accent-light h-4 w-4 stroke-2" />
              </button>
            </div>
          </template>
        </InputDoi>
      </TwFormField>
      <TwFormField label="Sale value">
        <TwInputText v-model="sale" class="input input-text-lg" />
      </TwFormField>
    </template>
  </EntityForm>
</template>

<script setup lang="tsx">
import { type Image, FilterOperator } from '@unb-libraries/nuxt-layer-entity'
import { type Specimen, type Publication } from 'types/specimen'
import { FormPublication } from '#components'

const props = defineProps<{
  specimen: Specimen
}>()

const emits = defineEmits<{
  save: [specimen: Specimen]
}>()

const { setContent, close: closeModal } = useModal()

const doiSearch = ref<string>()
function onResolveDoi({ citation, abstract, doi }: Publication) {
  const id = citation.substring(0, 10)
  setContent(PublicationModalForm({ id, doi, citation, abstract }))
  doiSearch.value = undefined
}

const PublicationModalForm = (publication: Publication, options?: Partial<{ title: string }>) => <div class={`space-y-3`}>
  <h1 class={`text-2xl`}>{options?.title ?? `Add publication` }</h1>
  <FormPublication publication={publication} onSave={onSavePublication} onCancel={closeModal} />
</div>

const onSavePublication = (publication: Publication) => {
  data.publications[publication.id] = publication
  closeModal()
}

const data = reactive({
  objectID: {
    unb: props.specimen.objectIDs.find(({ id }) => id.startsWith(`UNB`))!.id,
  } as Record<`unb` | string, string>,
  externalID: ``,
  collection: undefined as string | undefined,
  alias: [] as string[],
  description: ``,
  images: [] as string[],
  publications: {} as Record<string, Publication>,
  sale: undefined as number | undefined,
})

const alias = ref(``)
const doi = ref(``)
const { entities: collections } = await fetchEntityList(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `collection`]] })
const { entities: images, refresh } = await fetchEntityList<Image>(`File`, { filter: [[`type`, FilterOperator.EQUALS, `image`]] })
const imageOptions = computed(() => images.value
  .map(({ self, uri }) => ({ [self]: uri }))
  .reduce((acc, cur) => ({ ...acc, ...cur }), {}))

watch(alias, (als) => {
  if (als.at(-1) === `,`) {
    const [type, id] = als.slice(0, -1).split(`:`)
    data.objectID[type] = id
    alias.value = ``
  }
})

async function onNewFiles(files: File[]) {
  files.length > 1
    ? await useFileUpload<Image>(files)
    : await useFileUpload<Image>(files[0])
  refresh()
}

function onRemoveObjectId(type: string) {
  delete data.objectID[type]
}

function onRemovePublication(id: string) {
  delete data.publications[id]
}

// const { content, close: closeModal } = useModal()

// const unbOwned = ref(true)

// const defaultId = `${Math.floor(Math.random() * 1000000)}`
// const specimen = computed(() => ({
//   category: props.category,
//   objectID: {
//     unb: `UNB-${defaultId.padStart(8, `0`)}`,
//   },
//   age: {},
//   origin: {},
//   pieces: 1,
//   measurements: [{}],
//   ...props.specimen,
// }))

// const specimenType = props.category.substring(0, 1).toUpperCase() + props.category.substring(1)
// const { entities: classifications } = await fetchEntityList<TaxonomyTerm>(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `classification/${props.category}`]] })
// const { entities: images } = await fetchEntityList<Image>(`File`, { filter: [[`type`, FilterOperator.EQUALS, `image`]] })
// const { entities: portions } = await fetchEntityList<Term>(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `portion`]] })
// const { entities: ageUnits } = await fetchEntityList<Unit>(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `geochronology`]] })
// const { entities: people, add: addPerson } = await fetchEntityList<Person>(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `person`]] })

// async function onSavePerson(person: EntityJSONBody<Person>) {
//   await addPerson(person)
//   closeModal()
// }

// function padMeasurements(measurements: Measurement[], length: number) {
//   if (measurements.length < length) {
//     measurements.push(...Array.from(Array(length - measurements.length)).map(_ => ({} as Measurement)))
//   } else if (measurements.length > length) {
//     measurements.splice(length - 1, measurements.length - length)
//   }
//   return measurements
// }

// const setOrigin = function (coord: Coordinate, specimen: EntityJSONBody<Specimen>) {
//   const [newLat, newLong] = coord
//   specimen.origin = {
//     latitude: newLat,
//     longitude: newLong,
//     accuracy: 0,
//     name: ``,
//     description: ``,
//   }
// }

// const onSearchItemSelect = function (item: Location, specimen: EntityJSONBody<Specimen>) {
//   const { lat, lon } = item
//   setOrigin([lat, lon], specimen)
// }

const onSave = (specimen: Specimen) => {
  emits(`save`, specimen)
}
</script>
