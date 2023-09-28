<template>
  <section v-if="specimen" class="container mx-auto my-4">
    <h1 class="text-4xl">
      {{ specimen.name }}
    </h1>
  </section>
  <section v-if="specimen" class="container mx-auto my-4">
    <div v-if="message" class="my-4 border border-emerald-600 bg-emerald-200 p-3 text-emerald-900">
      {{ message }}
    </div>
    <FormSpecimen :specimen="specimen" @updated="onSpecimenUpdate" />
  </section>
</template>

<script setup lang="ts">
import type { Specimen } from 'entity-types/Specimen'

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
