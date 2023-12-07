<template>
  <NuxtLayout name="dashboard">
    <template #page-title>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="mr-2 h-5 w-5"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
      </svg>
      <span class="font-bold italic">{{ specimen?.name }}</span>
    </template>
    <template #sidebar>
      <PvComponentStack :stack="[[FormSpecimenDetails]]" />
    </template>
    <FormSpecimen :specimen="specimen!" @save="onSave" />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { type Specimen } from 'types/specimen'
import { type EntityJSONBody } from 'layers/base/types/entity'
import { FormSpecimenDetails } from "#components"

definePageMeta({
  layout: false,
})

const { slug } = useRoute().params
const { fetchByPK, update } = useEntityType<Specimen>(`Specimen`)
const { entity: specimen } = await fetchByPK(slug as string)
if (!specimen.value) {
  showError({ statusCode: 404 })
}

const onSave = async (specimen: EntityJSONBody<Specimen>) => {
  await update(specimen)
  await navigateTo(`/dashboard/specimens`)
}
</script>
