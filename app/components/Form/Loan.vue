<template>
  <EntityForm :entity="loan" @save="onSave" @cancel="onCancel">
    <template #default="{ body }">
      <div class="my-6 flex flex-row">
        <div class="mr-3 flex flex-col">
          <label class="mb-2 text-lg font-bold" for="type">Type</label>
          <PvInputSelect v-model="body.type" name="type" :options="[LoanType.IN, LoanType.OUT]" />
        </div>
        <div class="mr-3 flex grow flex-col">
          <label class="mb-2 text-lg font-bold" for="start">Start</label>
          <PvInputMask v-model="body.start" name="start" mask="9999-99-99" placeholder="YYYY-MM-DD" />
        </div>
        <div class="ml-3 flex grow flex-col">
          <label class="mb-2 text-lg font-bold" for="end">End</label>
          <PvInputMask v-model="body.end" name="end" mask="9999-99-99" placeholder="YYYY-MM-DD" />
        </div>
      </div>

      <!-- Contact -->
      <h3 class="text-primary-80 border-primary-80 mb-3 mt-12 w-full border-b py-2 text-sm uppercase">
        Contact
      </h3>
      <div class="my-6 flex flex-col">
        <label class="mb-2 text-lg font-bold" for="contact-name">Name</label>
        <PvInputText v-model="body.contact.name" />
      </div>
      <div class="my-6 flex flex-col">
        <label class="mb-2 text-lg font-bold" for="affiliation">Affiliation</label>
        <PvInputText v-model="body.contact.affiliation" />
      </div>
      <div class="my-6 flex flex-row">
        <div class="mr-3 flex w-1/2 flex-col">
          <label class="mb-2 text-lg font-bold" for="contact-phone">Phone</label>
          <PvInputText v-model="body.contact.phone" />
        </div>
        <div class="ml-3 flex w-1/2 flex-col">
          <label class="mb-2 text-lg font-bold" for="contact-email">Email</label>
          <PvInputText v-model="body.contact.email" />
        </div>
      </div>
    </template>
  </EntityForm>
</template>

<script setup lang="ts">
import { type EntityJSONBody, type EntityJSONProperties } from 'layers/base/types/entity'
import { type Loan, LoanType } from 'types/specimen'

defineProps<{
  loan: EntityJSONProperties<Loan>
}>()

const emits = defineEmits<{
  save: [loan: EntityJSONBody<Loan>]
  cancel: []
}>()

function onSave(loan: EntityJSONBody<Loan>) {
  loan.start = new Date(loan.start)
  loan.end = new Date(loan.end)
  emits(`save`, loan)
}

function onCancel() {
  emits(`cancel`)
}
</script>
