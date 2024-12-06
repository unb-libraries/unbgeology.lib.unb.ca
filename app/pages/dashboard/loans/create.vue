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

async function onSave({ specimens, ...loan }: EntityJSONBody<Omit<Loan, `subjects`> & { specimens: string[] }>) {
  const { error } = await create({ ...loan, subjects: specimens.map(specimen => ({ specimen })) })
  if (!error.value) {
    navigateTo(returnUrl)
  }
}
</script>
