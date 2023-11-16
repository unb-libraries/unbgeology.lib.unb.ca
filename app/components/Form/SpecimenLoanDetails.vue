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
      <button class="border-yellow text-yellow hover:bg-yellow hover:text-primary mb-1 w-full rounded-md border p-1">
        Edit
      </button>
      <button class="border-red text-red hover:bg-red mt-1 w-full rounded-md border p-1 hover:text-white" @click="removeLoan(loan)">
        Delete
      </button>
    </template>
  </PvDetailsPage>
</template>

<script setup lang="ts">
import { type EntityJSON } from 'layers/base/types/entity'
import { type Loan } from 'types/specimen'

const { loan, remove } = inject<{ loan: EntityJSON<Loan>, remove: typeof deleteEntity }>(`context`) as { loan: EntityJSON<Loan>, remove: typeof deleteEntity }
const unstack = inject<() => void>(`unstack`) as () => void

function removeLoan(loan: EntityJSON<Loan>) {
  remove(loan)
  unstack()
}
</script>
