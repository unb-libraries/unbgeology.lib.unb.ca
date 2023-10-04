<template>
  <NuxtLayout v-if="specimen" name="page">
    <template #title>
      Edit <span class="italic">{{ specimen.name }}</span>
    </template>
    <div v-if="message" class="my-4 border border-emerald-600 bg-emerald-200 p-3 text-emerald-900">
      {{ message }}
    </div>
    <FormSpecimen :specimen="specimen" @updated="onSpecimenUpdate" />
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Specimen } from 'entity-types/Specimen'

definePageMeta({
  layout: false,
})

const message = ref()

const { objectId } = useRoute().params
const { data: specimen, error } = await useFetch<Specimen>(`/api/specimens/${objectId}`)
if (error.value) {
  showError({ statusCode: 404 })
}

const onSpecimenUpdate = function (specimen: Partial<Specimen>) {
  message.value = `${specimen.name} has been updated.`
}
</script>
