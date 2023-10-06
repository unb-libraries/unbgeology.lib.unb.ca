<template>
  <FormSpecimen v-if="specimen" :specimen="specimen" />
</template>

<script setup lang="ts">
import type { Specimen } from 'entity-types/Specimen'

definePageMeta({
  layout: `dashboard`,
})

const { slug } = useRoute().params
const { data: specimen, error } = await useFetch<Specimen>(`/api/specimens/${slug}`)

if (error.value) {
  console.log(error.value)
  showError({ statusCode: 404 })
}
</script>
