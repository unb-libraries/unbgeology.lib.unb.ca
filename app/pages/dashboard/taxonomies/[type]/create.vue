<template>
  <TaxonomyTermForm
    :term="term"
    :type="(type as string)"
    :cancel-url="`/dashboard/taxonomies/${type}`"
  />
</template>

<script setup lang="ts">
import { Taxonomy } from '~/layers/base/types/entity'

definePageMeta({
  layout: `dashboard`,
})

const { type } = useRoute().params
const term = ref({})
</script>
