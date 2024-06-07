<template>
  <NuxtLayout name="dashboard-page">
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
      <FormSpecimen v-else :specimen="specimen!" @save="onSave" @cancel="navigateTo(`/dashboard/specimens`)" />
    </div>

    <template #sidebar>
      <EntityAdminSidebar :entities="[specimen!]">
        <PvEntityDetails :entity="specimen!" :fields="[[`id`, `ID`], [`type`, `Category`], `created`, `updated`, `status`]" class="space-y-4" label-class="font-bold italic">
          <template #id="{ value: id }">
            {{ id }}
          </template>
          <template #type="{ value: category }">
            {{ titleCased(category) }}
          </template>
          <template #status="{ value: status }">
            <span
              class="rounded-md px-1.5 py-0.5"
              :class="{
                'bg-blue text-base': getStatusValue(status) === Status.MIGRATED,
                'bg-yellow text-primary': getStatusValue(status) === Status.DRAFT,
                'bg-green text-base': getStatusValue(status) === Status.PUBLISHED,
              }"
            >{{ titleCased(getStatusLabel(status)) }}</span>
          </template>
        </PvEntityDetails>
        <template #actions>
          <div class="space-y-2">
            <button v-if="hasPermission(/^delete:specimen:/)" class="button button-lg button-outline-red-dark hover:button-red-dark w-full" @click.stop.prevent="onClickDelete">
              Delete
            </button>
          </div>
        </template>
      </EntityAdminSidebar>
    </template>
  </NuxtLayout>
</template>

<script setup lang="tsx">
import { type Specimen, Status } from 'types/specimen'

definePageMeta({
  layout: false,
  name: `Edit specimen`,
})

const { slug } = useRoute().params
const edit = ref(useRoute().query.edit)

onUpdated(() => {
  edit.value = useRoute().query.edit
})

const { hasPermission } = useCurrentUser()
const { createToast } = useToasts()
const { fetchByPK, remove, update } = useEntityType<Specimen>(`Specimen`)
const { entity: specimen } = await fetchByPK(slug as string)
if (!specimen.value) {
  showError({ statusCode: 404 })
}

const getStatusLabel = (status: Parameters<ReturnType<typeof useEnum<typeof Status>>[`labelOf`]>[0]) => useEnum(Status).labelOf(status)
const getStatusValue = (status: Parameters<ReturnType<typeof useEnum<typeof Status>>[`valueOf`]>[0]) => useEnum(Status).valueOf(status)

const onSave = async (values: Specimen) => {
  const { entity: updatedSpecimen, error } = await update({ self: specimen.value!.self, ...values })
  if (updatedSpecimen.value) {
    createToast(`update-${specimen.value!.id}`, () => `Updated specimen ${specimen.value!.id}`, { type: `success` })
    await navigateTo(`/dashboard/specimens`)
  } else if (error.value) {
    createToast(`error-updated-${specimen.value!.id}`, () => `${error.value}`, { type: `error` })
  }
}

const { setContent, close: closeModal } = useModal()
const onClickDelete = () => {
  const label = `the specimen "${specimen.value!.id.toUpperCase()}"`
  setContent(() => <PvEntityDeleteConfirm label={label} onConfirm={onDeleteConfirmed} onCancel={closeModal} />)
}

const onDeleteConfirmed = async () => {
  const { error } = await remove(specimen.value)
  if (!error.value) {
    closeModal()
    createToast(`delete-${specimen.value!.id}`, () => `Deleted specimen ${specimen.value!.id}`, { type: `warning` })
    await navigateTo(`/dashboard/specimens`)
  }
}
</script>
