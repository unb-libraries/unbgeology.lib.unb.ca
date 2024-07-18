<template>
  <FormAffiliatePerson @save="onSave" @cancel="navigateTo(returnUrl)" />
</template>

<script setup lang="ts">
import type { Person } from "~/types/affiliate"
definePageMeta({
  name: `Add person`,
  layout: `dashboard-page`,
  auth: {
    redirect: true,
    permission: /^create:term(:affiliate(:person)?)?/,
  },
  menu: {
    weight: 0,
  },
})

const { create } = useEntityType<Person>(`Term`)
const { createToast } = useToasts()
const returnUrl = useRoute().path.split(`/`).slice(0, -1).join(`/`)

async function onSave(values: Person) {
  const { error } = await create({ ...values, type: `affiliate/person` })
  if (!error.value) {
    createToast(`create-person`, () => `Person created`, { type: `success`, duration: 4000 })
    navigateTo(returnUrl)
  } else {
    createToast(`error-create-person`, () => `${error.value}`, { type: `error`, duration: 4000 })
  }
}

</script>
