<template>
  <FormAffiliatePerson :person="person!" @save="onSave" @cancel="navigateTo(returnUrl)" />
</template>

<script setup lang="ts">
import type { Person } from "~/types/affiliate"
definePageMeta({
  name: `Edit person`,
  layout: `dashboard-page`,
  auth: {
    redirect: true,
    permission: /^create:term(:affiliate(:(person))?)?/,
  },
  menu: {
    weight: 0,
  },
})

const { slug } = useRoute().params
const { fetchBy } = useEntityType<Person>(`Term`)

const { entity: person, update, error } = await fetchBy({ slug: slug as string, type: `affiliate/person` })
const { createToast } = useToasts()
const returnUrl = useRoute().path.split(`/`).slice(0, -1).join(`/`)

async function onSave(values: Person) {
  await update(values)
  if (!error.value) {
    createToast(`update-person`, () => `Person updated`, { type: `success`, duration: 4000 })
    navigateTo(returnUrl)
  } else {
    createToast(`error-update-person`, () => `${error.value}`, { type: `error`, duration: 4000 })
  }
}

</script>
