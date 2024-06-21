<template>
  <NuxtLayout name="dashboard-page">
    <template #actions>
      <NuxtLink v-if="hasPermission(/^create:term(:classification(:fossil)?)?/)" to="/dashboard/fossils/create" class="button button-lg button-accent-mid hover:button-accent-light">
        Add fossil
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
      :columns="schema.filter(({ id }) => [`label`, `parent`, `rank`].includes(id)).map(({ id, label }) => [id, label])"
      :multi-select="true"
      class="w-full"
      row-class="table-row"
      selected-row-class="active"
    >
      <template #label="{ entity: { label, slug} }">
        <NuxtLink v-if="hasPermission(/^update:term(:classification(:fossil)?)?:/)" :to="`/dashboard/fossils/${slug}`" class="hover:underline">
          {{ label }}
        </NuxtLink>
      </template>
      <template #parent="{ entity: { parent }}">
        <span v-if="parent">{{ parent.label }}</span>
      </template>
      <template #rank="{ entity: { rank }}">
        {{ rank ? titleCase(useEnum(Rank).labelOf(rank)) : `` }}
      </template>
    </EntityTable>
    <div class="flex w-full flex-row justify-between px-4">
      <span v-if="list?.total" class="italic">
        {{ (page - 1) * pageSize + 1 }} - {{ Math.min(list?.total ?? 0, page * pageSize) }} of {{ pluralize(list?.total ?? 0, `fossil`, `fossils`) }}
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
          <template #rank="{ value: rank }">
            {{ titleCase(useEnum(Rank).labelOf(rank)) }}
          </template>
          <template #status="{ value: status }">
            {{ titleCase(useEnum(Status).labelOf(status)) }}
          </template>
        </PvEntityDetails>
        <template #actions>
          <div class="space-y-2">
            <button v-if="hasPermission(/^update:term(:classification(:fossil)?)?:/) && selection.length === 1" class="button button-lg button-outline-yellow-light hover:button-yellow-light hover:text-primary w-full">
              Edit{{ selection.length > 1 ? ` ${selection.length} fossils` : `` }}
            </button>
            <button v-if="hasPermission(/^delete:term(:classification(:fossil)?)?:/)" class="button button-lg button-outline-red-dark hover:button-red-dark w-full" @click.stop.prevent="onClickDelete">
              Delete{{ selection.length > 1 ? ` ${selection.length} fossils` : `` }}
            </button>
          </div>
        </template>
      </EntityAdminSidebar>
      <span v-else>No fossil selected.</span>
    </template>
  </NuxtLayout>
</template>

<script setup lang="tsx">
import { FilterOperator } from '@unb-libraries/nuxt-layer-entity'
import { type Fossil as Classification, Rank, Status } from '~/types/classification'
import { PvEntityDeleteConfirm } from '#components'

definePageMeta({
  name: `Fossils`,
  layout: false,
  auth: {
    redirect: true,
    permission: /^(create|update|delete):term(:classification(:fossil)?)?/,
  },
  menu: {
    weight: 30,
  },
})

const { hasPermission } = useCurrentUser()
const { values: schema, keys } = defineEntitySchema<Classification>(`Classification`, [`label`, `slug`, `parent`, `rank`, `created`, `updated`, `status`], {
  fieldPermission: id => new RegExp(`read:term(:classification(:fossil)?)?:(${id}|\\*)`),
})

const selection = ref<Classification[]>([])
const { entities: terms, list, query: { page, pageSize, search }, remove, removeMany } = await fetchEntityList<Classification>(`Term`, {
  select: keys,
  sort: [`label`],
  filter: [[`type`, FilterOperator.EQUALS, `classification/fossil`]],
})

const titleCase = (str: string) => str[0].toUpperCase() + str.slice(1).toLowerCase()
const { setContent, close: closeModal } = useModal()
const onClickDelete = () => {
  const label = selection.value.length > 1 ? `${selection.value.length} fossils` : `the fossil "${selection.value[0].label}"`
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
