<template>
  <div class="space-y-12">
    <nav class="flex flex-row">
      <NuxtLink :to="`${$route.path}`" class="dark:bg-accent-dark/10 hover:dark:bg-accent-dark/20 w-1/4 py-4 text-center text-lg" :class="{ 'border-accent-mid dark:bg-accent-dark/20 border-b-4': !edit }">
        General
      </NuxtLink>
      <NuxtLink :to="`${$route.path}?edit=details`" class="dark:bg-accent-dark/10 hover:dark:bg-accent-dark/20 w-1/4 py-4 text-center text-lg" :class="{ 'border-accent-mid dark:bg-accent-dark/20 border-b-4': edit === `details` }">
        Details
      </NuxtLink>
      <NuxtLink :to="`${$route.path}?edit=origin`" class="dark:bg-accent-dark/10 hover:dark:bg-accent-dark/20 w-1/4 py-4 text-center text-lg" :class="{ 'border-accent-mid dark:bg-accent-dark/20 border-b-4': edit === `origin` }">
        Origin
      </NuxtLink>
      <NuxtLink :to="`${$route.path}?edit=storage`" class="dark:bg-accent-dark/10 hover:dark:bg-accent-dark/20 w-1/4 py-4 text-center text-lg" :class="{ 'border-accent-mid dark:bg-accent-dark/20 border-b-4': edit === `storage` }">
        Storage
      </NuxtLink>
    </nav>

    <FormSpecimenDetails v-if="edit === `details`" :category="specimen!.type" />
    <FormSpecimenOrigin v-else-if="edit === `origin`" />
    <FormSpecimenStorage v-else-if="edit === `storage`" />
    <FormSpecimen v-else :specimen="specimen!" />
  </div>
</template>

<script setup lang="ts">
import { type Specimen } from 'types/specimen'
// import { type EntityJSONBody } from "@unb-libraries/nuxt-layer-entity"
// import { FormSpecimenDetails } from "#components"

definePageMeta({
  layout: `dashboard-page`,
  name: `Edit specimen`,
})

const { slug } = useRoute().params
const edit = ref(useRoute().query.edit)

onUpdated(() => {
  edit.value = useRoute().query.edit
})

const { fetchByPK, update } = useEntityType<Specimen>(`Specimen`)
const { entity: specimen } = await fetchByPK(slug as string)
if (!specimen.value) {
  showError({ statusCode: 404 })
}

// const onSave = async (specimen: EntityJSONBody<Specimen>) => {
//   await update(specimen)
//   await navigateTo(`/dashboard/specimens`)
// }
</script>
