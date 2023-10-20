<template>
  <TaxonomyTermForm
    :term="term!"
    :type="(type as string)"
    :cancel-url="`/dashboard/taxonomies/${type}`"
  />
</template>

<script setup lang="ts">
import { Taxonomy } from '~/layers/base/types/entity'

definePageMeta({
  layout: `dashboard`,
})

const { type, slug } = useRoute().params
const { fetchByPK } = useEntityType<Taxonomy>(Symbol(`taxonomies`), type as string)
const { entity: term } = await fetchByPK(slug as string)

if (!term.value) {
  showError({ statusCode: 404 })
}
</script>
