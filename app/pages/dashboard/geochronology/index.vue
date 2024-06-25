<template>
  <NuxtLayout name="dashboard-page">
    <template #actions>
      <NuxtLink v-if="hasPermission(/^create:term(:geochronology)?/)" to="/dashboard/geochronology/create" class="button button-lg button-accent-mid hover:button-accent-light">
        Add unit
      </NuxtLink>
    </template>

    <div class="relative flex flex-row">
      <TwFormField label="Search" label-class="sr-only" class="w-full">
        <TwInputSearch v-model="search" class="input input-text-md w-full" text-wrapper-class="w-full" />
      </TwFormField>
    </div>

    <EntityTable
      v-model="selection"
      :entities="terms"
      :columns="schema.filter(({ id }) => [`label`, `parent`, `division`, `start`].includes(id)).map(({ id, label }) => [id, label])"
      :multi-select="true"
      class="w-full"
      row-class="table-row"
      selected-row-class="active"
    >
      <template #label="{ entity: { label, slug, color } }">
        <div class="inline-flex items-center space-x-3">
          <svg class="h-6 w-6 rounded-md" view-box="0 0 24 24"><rect width="24" height="24" :fill="color" /></svg>
          <NuxtLink v-if="hasPermission(/^update:term(:geochronology)?:/)" :to="`/dashboard/geochronology/${slug}`" class="hover:underline">
            {{ label }}
          </NuxtLink>
          <span v-else>{{ label }}</span>
        </div>
      </template>
      <template #parent="{ entity: { parent }}">
        <span v-if="parent">{{ parent.label }}</span>
      </template>
      <template #division="{ entity: { division }}">
        {{ titleCased(useEnum(Division).labelOf(division)) }}
      </template>
      <template #start="{ entity: { gssp, start, uncertainty }}">
        {{ (gssp === false ? `~` : ``) + (start / 1e6) + (uncertainty ? ` ± ${uncertainty / 1e6}` : ``) }}
      </template>
    </EntityTable>
    <div class="flex w-full flex-row justify-between px-4">
      <span v-if="list?.total" class="italic">
        {{ (page - 1) * pageSize + 1 }} - {{ Math.min(list?.total ?? 0, page * pageSize) }} of {{ pluralize(list?.total ?? 0, `unit`, `units`) }}
      </span>
      <PvPaginator v-model="page" :total="Math.ceil((list?.total ?? 0) / pageSize)" :size="pageSize" />
    </div>

    <template #sidebar>
      <EntityAdminSidebar v-if="selection.length" :entities="selection">
        <PvEntityDetails v-if="selection.length === 1" :entity="selection[0]" :fields="schema.map(({ id, label }) => [id, label])" class="space-y-4" label-class="font-bold italic">
          <template #parent="{ value: parent }">
            <span v-if="parent">{{ parent.label }}</span>
            <span v-else>None</span>
          </template>
          <template #division="{ value: division }">
            {{ titleCased(useEnum(Division).labelOf(division)) }}
          </template>
          <template #start="{ entity: { gssp, start, uncertainty } }">
            <template v-if="start !== undefined">
              {{ (gssp === false ? `~` : ``) + (start / 1e6) + (uncertainty ? ` ± ${uncertainty / 1e6}` : ``) }}
            </template>
          </template>
          <template #color="{ value: color }">
            <svg class="mt-2 h-6 w-6 rounded-md"><rect width="100%" height="100%" x="0" y="0" :fill="color" /></svg>
          </template>
          <template #status="{ value: status }">
            {{ titleCased(useEnum(Status).labelOf(status)) }}
          </template>
        </PvEntityDetails>
        <template #actions>
          <div class="space-y-2">
            <button v-if="hasPermission(/^update:term(:geochronology)?:/) && selection.length === 1" class="button button-lg button-outline-yellow-light hover:button-yellow-light hover:text-primary w-full">
              Edit{{ selection.length > 1 ? ` ${selection.length} units` : `` }}
            </button>
            <button v-if="hasPermission(/^delete:term(:geochronology)?:/)" class="button button-lg button-outline-red-dark hover:button-red-dark w-full" @click.stop.prevent="onClickDelete">
              Delete{{ selection.length > 1 ? ` ${selection.length} units` : `` }}
            </button>
          </div>
        </template>
      </EntityAdminSidebar>
      <span v-else>No unit selected.</span>
    </template>
  </NuxtLayout>
</template>

<script setup lang="tsx">
import { FilterOperator } from '@unb-libraries/nuxt-layer-entity'
import { type Unit, Division, Status } from '~/types/geochronology'
import { PvEntityDeleteConfirm } from '#components'

definePageMeta({
  name: `Geochronology`,
  layout: false,
  auth: {
    redirect: true,
    permission: /^(create|update|delete):term(:geochronology)?/,
  },
  menu: {
    weight: 60,
  },
})

const { hasPermission } = useCurrentUser()
const { values: schema } = defineEntitySchema<Unit>(`Geochronology`, [`label`, `slug`, `parent`, `division`, [`start`, `Mya`], `color`, `created`, `updated`, `status`], {
  fieldPermission: id => new RegExp(`read:term(:geochronology)?:(${id}|\\*)`),
})

const selection = ref<Unit[]>([])
const { entities: terms, list, query: { page, pageSize, search }, remove, removeMany } = await fetchEntityList<Unit>(`Term`, {
  sort: [`label`],
  filter: [[`type`, FilterOperator.EQUALS, `geochronology`]],
})

const { setContent, close: closeModal } = useModal()
const onClickDelete = () => {
  const label = selection.value.length > 1 ? `${selection.value.length} units` : `the unit "${selection.value[0].label}"`
  setContent(() => <PvEntityDeleteConfirm label={label} onConfirm={onRemove} onCancel={closeModal} />)
}
const onRemove = async () => {
  if (selection.value.length === 1) {
    await remove(selection.value[0])
  } else {
    await removeMany(selection.value)
  }
  selection.value = []
  closeModal()
}

</script>
