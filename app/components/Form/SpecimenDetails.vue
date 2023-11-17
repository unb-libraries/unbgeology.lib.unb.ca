<template>
  <PvDetailsPage v-if="specimen">
    <template #nav>
      <!-- Workaround for removing navigation. -->
      <div />
    </template>
    <PvEntityDetails :entity="specimen!" :fields="[`storage`, `loans`, `publications`, `editor`, `created`, [`updated`, `Last updated`], `status`]" item-class="my-2 first:mt-0 last:mb-0" label-class="text-md text-primary-60">
      <template #storage="{ value: storage }">
        <div>Stored in {{ storage.at(-1).location.label }} since {{ storage.at(-1).dateIn }}.</div>
        <span class="hover:text-accent-mid text-primary-40 cursor-pointer text-sm" @click="onViewStorageHistory(storage)">View previous storage locations</span>
      </template>
      <template #loans>
        <PvEntityList :entities="loans" :label="loan => loan.contact.affiliation" item-class="hover:text-accent-mid cursor-pointer">
          <template #default="{ entity: loan }">
            <span @click="onSelectLoan(loan)">{{ loan.contact.affiliation }}</span>
          </template>
        </PvEntityList>
      </template>
      <template #publications>
        <PvEntityList :entities="publications" :label="publication => publication.id" item-class="hover:text-accent-mid cursor-pointer">
          <template #default="{ entity: publication }">
            <span @click="onSelectPublication(publication)">{{ publication.id }}</span>
          </template>
        </PvEntityList>
      </template>
      <template #editor="{ value }">
        {{ value.username }}
      </template>
    </PvEntityDetails>
    <template #actions>
      <button class="border-red text-red hover:bg-red w-full rounded-md border p-1 hover:text-white">
        Delete
      </button>
    </template>
  </PvDetailsPage>
</template>

<script setup lang="ts">
import { Publication, type Loan, Storage } from 'types/specimen'
import { type EntityJSON } from 'layers/base/types/entity'
import { FormSpecimenStorageHistoryDetails, FormSpecimenLoanDetails, FormSpecimenPublicationDetails } from '#components'

const emits = defineEmits<{
  stack: [component: any, context: any]
}>()

const { slug } = useRoute().params
const specimen = inject(`context`)

const { list: publicationsList, remove: removePublication } = await fetchEntityList<Publication>(`/api/specimens/${slug}/publications`)
const publications = computed(() => publicationsList.value?.entities ?? [])

const { list: loansList, remove: removeLoan } = await fetchEntityList<Loan>(`/api/specimens/${slug}/loans`)
const loans = computed(() => loansList.value?.entities ?? [])

function onViewStorageHistory(storage: EntityJSON<Storage>[]) {
  emits(`stack`, FormSpecimenStorageHistoryDetails, storage)
}

function onSelectPublication(publication: EntityJSON<Publication>) {
  emits(`stack`, FormSpecimenPublicationDetails, { publication, remove: removePublication })
}

function onSelectLoan(loan: EntityJSON<Loan>) {
  emits(`stack`, FormSpecimenLoanDetails, { loan, remove: removeLoan })
}
</script>
