<template>
  <EntityForm :entity="loan" @save="onSave" @cancel="onCancel">
    <template #default="{ body }">
      <div class="form-row form-row-3">
        <div class="form-field">
          <label for="type">Type</label>
          <PvInputSelect v-model="body.type" name="type" :options="[LoanType.IN, LoanType.OUT]" />
        </div>
        <div class="form-field">
          <label for="start">Start</label>
          <PvInputMask v-model="body.start" name="start" mask="9999-99-99" placeholder="YYYY-MM-DD" />
        </div>
        <div class="form-field">
          <label for="end">End</label>
          <PvInputMask v-model="body.end" name="end" mask="9999-99-99" placeholder="YYYY-MM-DD" />
        </div>
      </div>

      <!-- Contact -->
      <h3 class="form-section-heading">
        Contact
      </h3>
      <div class="form-field">
        <label for="contact-name">Name</label>
        <PvInputText v-model="body.contact.name" />
      </div>
      <div class="form-field">
        <label for="affiliation">Affiliation</label>
        <PvInputText v-model="body.contact.affiliation" />
      </div>
      <div class="form-row form-row-2">
        <div class="form-field">
          <label for="contact-phone">Phone</label>
          <PvInputText v-model="body.contact.phone" />
        </div>
        <div class="form-field">
          <label for="contact-email">Email</label>
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
  emits(`save`, {
    ...loan,
    start: new Date(loan.start),
    end: new Date(loan.end),
  })
}

function onCancel() {
  emits(`cancel`)
}
</script>
