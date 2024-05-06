<template>
  <FormPerson :person="person" @save="onCreate" />
</template>

<script setup lang="ts">
import { type Person } from 'types/affiliate'
import { type EntityJSONBody, type EntityJSONProperties } from "@unb-libraries/nuxt-layer-entity"

const person = ref<EntityJSONProperties<Person>>({
  firstName: ``,
  lastName: ``,
  email: ``,
  phone: ``,
  public: false,
  affiliations: [],
})

definePageMeta({
  layout: `dashboard`,
})

function onCreate(person: EntityJSONBody<Person>) {
  const { create } = useEntityType(`People`)
  create(person)
  navigateTo(`/dashboard/affiliates/people`)
}
</script>
