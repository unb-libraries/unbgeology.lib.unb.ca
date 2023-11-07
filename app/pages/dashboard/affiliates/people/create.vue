<template>
  <FormPerson :person="person" @save="onCreate" />
</template>

<script setup lang="ts">
import { type Person } from 'types/affiliation'
import { EntityJSONBody, type EntityJSONProperties } from 'layers/base/types/entity'

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
  const { create } = useEntityType(Symbol(`affiliations`), `people`)
  create(person)
  navigateTo(`/dashboard/affiliates/people`)
}
</script>
