<template>
  <FormSpecimen :specimen="specimen" @save="onSave" />
</template>

<script setup lang="ts">
import { type EntityJSONBody, type EntityJSONProperties } from 'layers/base/types/entity'
import { type Specimen } from 'types/specimen'

definePageMeta({
  layout: `dashboard`,
})

const specimen = ref<EntityJSONProperties<Specimen>>({
  measurements: [{}],
  pieces: 1,
  origin: {},
} as EntityJSONProperties<Specimen>)

const onSave = async (specimen: EntityJSONBody<Specimen>) => {
  const { create } = useEntityType(Symbol(`specimens`))
  await create(specimen)
  await navigateTo(`/dashboard/specimens`)
}
</script>
