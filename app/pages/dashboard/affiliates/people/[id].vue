<template>
  <FormPerson v-if="person" :entity="person" @save="onUpdate" @cancel="navigateTo(`/dashboard/affiliates/people`)" />
</template>

<script setup lang="ts">
import { type Person } from 'types/affiliate'
import { type EntityJSONBody } from "@unb-libraries/nuxt-layer-entity"

definePageMeta({
  layout: `dashboard`,
})

const { id } = useRoute().params
const { fetchByPK, update } = useEntityType<Person>(`People`)
const { entity: person } = await fetchByPK(id as string)

function onUpdate(person: EntityJSONBody<Person>) {
  update(person)
  navigateTo(`/dashboard/affiliates/people`)
}
</script>
