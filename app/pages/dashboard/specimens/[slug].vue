<template>
  <FormSpecimen v-if="specimen" :specimen="specimen" @save="onSave" />
</template>

<script setup lang="ts">
import { type Specimen } from 'types/specimen'
import { type EntityJSONBody } from 'layers/base/types/entity'

definePageMeta({
  layout: `dashboard`,
})

const { slug } = useRoute().params
const { fetchByPK, update } = useEntityType<Specimen>(Symbol(`specimens`))
const { entity: specimen } = await fetchByPK(slug as string)

if (!specimen.value) {
  showError({ statusCode: 404 })
}

const onSave = async (specimen: EntityJSONBody<Specimen>) => {
  await update(specimen)
  await navigateTo(`/dashboard/specimens`)
}
</script>
