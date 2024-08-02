<template>
  <div class="input input-text-lg flex flex-row space-x-2">
    <div v-for="{ id } in publications" :key="id" class="bg-accent-mid hover:bg-accent-light inline-flex space-x-1 text-nowrap rounded-md px-1.5 text-sm leading-6 text-white hover:cursor-pointer" @click.stop.prevent="onEdit(id)">
      <span>{{ id }}</span>
      <button @click.prevent.stop="onRemove(id)">
        <IconCancel class="fill-accent-dark hover:stroke-base hover:fill-red stroke-accent-light size-4 stroke-2" />
      </button>
    </div>
    <div class="text-primary-40 grow italic hover:cursor-pointer" @click.stop.prevent="onAdd">
      Add publication
    </div>
  </div>
  <!-- <div>
    <TwInputRadioGroup :options="[[`search`, `Search by DOI`], [`manual`, `Enter manually`]]" v-model="mode" class="flex-row space-x-3" />
    <InputDoi v-if="mode === `search`" v-model="doiSearch" placeholder="Search by DOI, e.g. https://doi.org/10.1130/GES01535.1" @resolve="onResolveDoi">
    <template #before>
      <div v-for="(publication, id) of data.publications" :key="id" class="hover:bg-accent-light text-nowrap bg-accent-mid inline-flex cursor-pointer space-x-2 rounded-md px-1.5 text-sm leading-6" @click="openPublicationFormModal({ publication })">
        {{ id }}
        <button @click.prevent.stop="onRemovePublication(id as string)">
          <IconCancel class="fill-accent-dark hover:stroke-base hover:fill-red stroke-accent-light h-4 w-4 stroke-2" />
        </button>
      </div>
    </template>
  </InputDoi>
  </div> -->
</template>

<script setup lang="tsx">
import { type Publication } from 'types/specimen'
import { FormPublication, InputDoi, TwFormField } from '#components'
// import useEntityFormModal from '~/layers/primevue/composables/useEntityFormModal'

const publications = defineModel<Publication[]>({ required: false, default: [] })

const { setContent, close } = useModal()

function onAdd() {
  const openForm = () => setContent(() => <FormPublication onSave={onSave} onCancel={close} />)
  const error = ref()
  setContent(() =>
    <div class={`space-y-1`}>
      <TwFormField label={`Search by DOI`}>
        <div>
          <InputDoi placeholder={`Search by DOI, e.g. https://doi.org/10.1130/GES01535.1`} onResolve={onResolveDoi} onError={(msg: string) => { error.value = msg }} />
          <span class={`text-sm ${error.value ? ` text-red` : ``}`}>{ error.value || `\u00A0`}</span>
        </div>
      </TwFormField>
      <div class={`text-center text-sm`}>Or <a class={`cursor-pointer italic underline`} onClick={openForm}>enter manually</a> instead</div>
    </div>)
}

function onEdit(id: string) {
  const index = publications.value.findIndex(p => p.id === id)
  setContent(() => <FormPublication publication={publications.value[index]} onSave={onSave} onCancel={close} />)
}

function onRemove(id: string) {
  publications.value = publications.value.filter(p => p.id !== id)
}

function onSave(publication: Publication) {
  const index = publications.value.findIndex(p => p.id === publication.id) ?? -1
  if (index >= 0) {
    publications.value = publications.value.map((p, i) => i === index ? publication : p)
  } else {
    publications.value = [...publications.value, publication]
  }
  close()
}

// const { open: openPublicationFormModal } = useEntityFormModal(, {
//   onSave: (publication: Publication) => {
//     props.publications?.[publication.id] = publication
//   },
// })

function onResolveDoi({ citation, abstract, doi }: Publication) {
  const cindex = citation.indexOf(`,`)
  const id = citation.substring(0, cindex > 0 ? cindex : 10).trim()
  setContent(() => <FormPublication publication={{ id, doi, citation, abstract }} onSave={onSave} onCancel={close} />)
  // openPublicationFormModal({ publication: { id, doi, citation, abstract } })
  // doiSearch.value = undefined
}
</script>
