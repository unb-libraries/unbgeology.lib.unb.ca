<template>
  <FormLoan
    :entity="loan!"
    @save="onSave"
    @cancel="navigateTo(returnUrl)"
  />
</template>

<script lang="ts" setup>
import type { EntityJSONBody } from '@unb-libraries/nuxt-layer-entity'
import type { Loan } from '~/types/loan'

definePageMeta({
  layout: `dashboard-page`,
  name: `Edit loan`,
  auth: {
    redirect: true,
    permission: /^update:loan/,
  },
})

const { id } = useRoute().params
if (!id) {
  showError(`Loan not found.`)
}

const { fetchBy } = useEntityType<Loan>(`Loan`)
const { entity: loan, update } = await fetchBy({ id: id as string })
if (!loan.value) {
  showError(`Loan not found.`)
}

const returnUrl = `/dashboard/loans`

async function onSave({ type, start, end, description, specimens, contract, contact }: EntityJSONBody<Loan>) {
  await update({
    type,
    start,
    end,
    description: description ?? (loan.value?.description ? `` : undefined),
    contact,
    specimens,
    contract,
  })
  navigateTo(returnUrl)
}
</script>
