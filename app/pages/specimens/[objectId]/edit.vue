<template>
  <section v-if="specimen" class="container mx-auto my-4">
    <h1 class="text-4xl">
      {{ specimen.name }}
    </h1>
  </section>
  <section v-if="specimen" class="container mx-auto my-4">
    <FormSpecimen :specimen="specimen" />
  </section>
</template>

<script setup lang="ts">
import type { Specimen } from 'entity-types/Specimen'

const objectId = useRoute().params.objectId
const { data: specimen, error } = await useFetch<Specimen>(`/api/specimens/${objectId}`)
if (error.value) {
  showError({ statusCode: 404 })
}
</script>
