<template>
  <FormCompositionCreate
    @save="onSave"
    @cancel="navigateTo(returnUrl)"
  />
</template>

<script setup lang="ts">
import type { Composition, CompositionCreateBody } from '~/types/composition'

definePageMeta({
  name: `Add composition`,
  layout: `dashboard-page`,
  auth: {
    redirect: true,
    permission: /^create:term(:composition(:fossil|rock)?)?/,
  },
  menu: {
    weight: 0,
  },
})

const { create } = useEntityType<Composition, CompositionCreateBody>(`Term`)
const returnUrl = `/dashboard/composition`

async function onSave({ label, type }: CompositionCreateBody) {
  await create({ label, type })
  navigateTo(returnUrl)
}
</script>
