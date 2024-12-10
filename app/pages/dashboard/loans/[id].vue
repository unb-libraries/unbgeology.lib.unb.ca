<template>
  <FormLoan
    :entity="loan!"
    @save="onSave"
    @cancel="navigateTo(returnUrl)"
  />
</template>

<script lang="ts" setup>
import type { EntityJSONList, EntityJSONBody } from '@unb-libraries/nuxt-layer-entity'
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

const { data } = await useFetch<EntityJSONList<Loan>>(`/api/loans?id=${id}`)
const loan = data.value?.entities[0]
if (!loan) {
  showError(`Loan not found.`)
}

const returnUrl = `/dashboard/loans`

async function onSave({ type, start, end, description, specimens, contract, contact }: EntityJSONBody<Omit<Loan, `subjects`>> & { specimens: string[] }) {
  await useFetch(loan!.self, {
    method: `PATCH`,
    body: {
      type,
      start,
      end,
      description: description ?? (loan?.description ? `` : undefined),
      contact,
      specimens,
      contract,
    },
  })
  navigateTo(returnUrl)
}
</script>
