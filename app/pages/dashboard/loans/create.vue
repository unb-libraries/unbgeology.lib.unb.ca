<template>
  <FormLoan
    @save="onSave"
    @cancel="navigateTo(returnUrl)"
  />
</template>

<script lang="ts" setup>
import type { EntityJSONBody } from '@unb-libraries/nuxt-layer-entity'
import type { Loan } from '~/types/loan'

definePageMeta({
  name: `Add loan`,
  layout: `dashboard-page`,
  auth: {
    redirect: true,
    permission: /^create:loan/,
  },
  menu: {
    weight: 0,
  },
})

const { create } = useEntityType<Loan>(`Loan`)
const returnUrl = `/dashboard/loans`

async function onSave(loan: EntityJSONBody<Omit<Loan, `specimens`> & { specimens: string[] }>) {
  const { error } = await create(loan)
  if (!error.value) {
    navigateTo(returnUrl)
  }
}
</script>
