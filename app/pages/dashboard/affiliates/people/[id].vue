<template>
  <FormPerson v-if="person" :person="person" @save="onUpdate" />
</template>

<script setup lang="ts">
import { type Person } from 'types/affiliation'
import { type EntityJSONBody } from 'layers/base/types/entity'

definePageMeta({
  layout: `dashboard`,
})

const { id } = useRoute().params
const { fetchByPK, update } = useEntityType<Person>(Symbol(`affiliations`), `people`)
const { entity: person } = await fetchByPK(id as string)

function onUpdate(person: EntityJSONBody<Person>) {
  update(person)
  navigateTo(`/dashboard/affiliates/people`)
}
</script>
