<template>
  <FormSpecimenCreate />
</template>

<script setup lang="ts">
import { type EntityJSONBody } from "@unb-libraries/nuxt-layer-entity"
import { type Specimen } from 'types/specimen'

definePageMeta({
  layout: `dashboard-page`,
  name: `Create specimen`,
})

// const category = useRoute().query.category as string ?? `fossil`

const onSave = async (specimen: EntityJSONBody<Specimen>) => {
  const { create } = useEntityType<Specimen>(`Specimen`)
  await create(specimen)
  await navigateTo(`/dashboard/specimens`)
}
</script>
