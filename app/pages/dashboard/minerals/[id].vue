<template>
  <FormMineralClassification :entity="mineral!" :parents="minerals" @save="onUpdate" @cancel="navigateTo(`/dashboard/terms/mineral`)" />
</template>

<script setup lang="ts">
import type { EntityJSONBody } from '@unb-libraries/nuxt-layer-entity'
import { type MineralClassification as Classification } from '~/types/classification'

definePageMeta({
  layout: `dashboard`,
})

const { id } = useRoute().params
const { fetchByPK, fetchAll, update } = useEntityType<Classification>(`Mineral.Classification`)
const { entity: mineral } = await fetchByPK(id as string)
const { entities: minerals } = await fetchAll()

if (!mineral.value) {
  createError({ statusCode: 404 })
}

async function onUpdate(mineral: EntityJSONBody<Classification>) {
  await update(mineral)
  navigateTo(`/dashboard/terms/mineral`)
}
</script>
