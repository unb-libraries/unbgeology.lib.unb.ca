<template>
  <PvDetailsPage v-if="specimen">
    <template #nav>
      <!-- Workaround for removing navigation. -->
      <div />
    </template>
    <PvEntityDetails :entity="specimen!" :fields="[`storage`, `loans`, `editor`, `created`, [`updated`, `Last updated`], `status`]" item-class="my-2 first:mt-0 last:mb-0" label-class="text-md text-primary-60">
      <template #storage="{ value: storage }">
        <template v-if="Array.isArray(storage) && storage.length > 0">
          <div>Stored in {{ storage.at(-1).location.label }} since {{ storage.at(-1).dateIn }}.</div>
          <span class="hover:text-accent-mid text-primary-40 cursor-pointer text-sm" @click="onViewStorageHistory(storage)">View previous storage locations</span>
        </template>
        <template v-else>
          Unknown
        </template>
      </template>
      <template #loans>
        <PvEntityList v-if="Array.isArray(loans) && loans.length > 0" :entities="loans" :label="loan => loan.contact.affiliation" item-class="hover:text-accent-mid cursor-pointer">
          <template #default="{ entity: loan }">
            <span @click="onSelectLoan(loan)">{{ loan.contact.affiliation }}</span>
          </template>
        </PvEntityList>
        <template v-else>
          None
        </template>
      </template>
      <template #editor="{ value: editor }">
        {{ editor ? editor.username : `Unknown` }}
      </template>
    </PvEntityDetails>
    <template #actions>
      <button class="border-red text-red hover:bg-red w-full rounded-md border p-1 hover:text-white" @click="showConfirmModal = true">
        Delete
        <PvModalConfirm v-if="showConfirmModal" modal-class="top-1/2" content-class="text-center text-2xl" @confirm="removeSpecimen(specimen)" @cancel="showConfirmModal = false">
          Are you sure you want to delete <span class="italic">{{ specimen.name }}</span>?
        </PvModalConfirm>
      </button>
    </template>
  </PvDetailsPage>
</template>

<script setup lang="ts">
import { type Loan, type Storage, type Specimen } from 'types/specimen'
import { type EntityJSON } from 'layers/base/types/entity'
import { FormSpecimenStorageHistoryDetails, FormSpecimenLoanDetails } from '#components'

const emits = defineEmits<{
  stack: [component: any, context?: any]
}>()

const { slug } = useRoute().params
const { fetchByPK, remove } = useEntityType<Specimen>(`Specimen`)
const { entity: specimen } = await fetchByPK(slug as string)

// REFACTOR: use entity list handler
const { entities: loans } = await fetchEntityList<Loan>(`${specimen.value!.self}/loans`)

const showConfirmModal = ref(false)

function onViewStorageHistory(storage: EntityJSON<Storage>[]) {
  emits(`stack`, FormSpecimenStorageHistoryDetails)
}

function onSelectLoan(loan: EntityJSON<Loan>) {
  emits(`stack`, FormSpecimenLoanDetails, loan.id)
}

async function removeSpecimen(specimen: EntityJSON<Specimen>) {
  await remove(specimen)
  showConfirmModal.value = false
  navigateTo(`/dashboard/specimens`)
}
</script>
