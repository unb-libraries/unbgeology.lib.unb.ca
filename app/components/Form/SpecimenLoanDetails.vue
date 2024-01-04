<template>
  <PvDetailsPage v-if="loan">
    <PvEntityDetails :entity="loan" :fields="['organization', 'duration', 'contact']" label-class="text-md text-primary-60" item-class="my-2 first:mt-0 last:mb-0">
      <template #organization>
        {{ loan.contact.affiliation }}
      </template>
      <template #duration>
        {{ loan.start }} - {{ loan.end }}
      </template>
      <template #contact>
        <div class="flex flex-col">
          <span>{{ loan.contact.name }}</span>
          <span>Email: {{ loan.contact.email }}</span>
          <span>Phone: {{ loan.contact.phone }}</span>
        </div>
      </template>
    </PvEntityDetails>
    <template #actions>
      <button class="border-yellow text-yellow hover:bg-yellow hover:text-primary mb-1 w-full rounded-md border p-1" @click="showEditForm = true">
        Edit
        <PvModal v-if="showEditForm">
          <FormLoan :loan="loan" @save="updatedLoan => updateLoan(updatedLoan)" @cancel="showEditForm = false" />
        </PvModal>
      </button>
      <button class="border-red text-red hover:bg-red mt-1 w-full rounded-md border p-1 hover:text-white" @click="showConfirmModal = true">
        Delete
        <PvModalConfirm v-if="showConfirmModal" modal-class="top-1/2" content-class="text-center text-2xl" @confirm="removeLoan(loan)" @cancel="showConfirmModal = false">
          Are you sure you want to delete this loan?
        </PvModalConfirm>
      </button>
    </template>
  </PvDetailsPage>
</template>

<script setup lang="ts">
import { type EntityJSONBody, type EntityJSONReference } from "@unb-libraries/nuxt-layer-entity"
import { type Loan } from 'types/specimen'

const { slug } = useRoute().params
const loanId = inject<string>(`context`)
const { fetchByPK, remove, update } = useEntityType<Loan>(Symbol(`specimens/${slug}/loans`))
const { entity: loan } = await fetchByPK(loanId as string)

const showConfirmModal = ref(false)
const showEditForm = ref(false)

function updateLoan(loan: EntityJSONBody<Loan>) {
  update(loan)
  showEditForm.value = false
}

function removeLoan(loan: EntityJSONReference) {
  remove(loan)
  showConfirmModal.value = false
}
</script>
