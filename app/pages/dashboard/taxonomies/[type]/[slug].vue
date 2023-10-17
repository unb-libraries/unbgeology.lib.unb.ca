<template>
  <FormTaxonomyTerm
    v-if="term"
    :uri="`/api/taxonomies/${type}`"
    :term="term"
    :redirect-on-success="`/dashboard/taxonomies/${type}`"
    :redirect-on-cancel="`/dashboard/taxonomies/${type}`"
  />
</template>

<script setup lang="ts">
import type { Taxonomy } from '~/layers/mongo/types/taxonomy'

definePageMeta({
  layout: `dashboard`,
})

const { type, slug } = useRoute().params
const { data: term } = await useFetch<Taxonomy>(`/api/taxonomies/${type}/${slug}`)

if (!term.value) {
  showError({ statusCode: 404 })
}
</script>
