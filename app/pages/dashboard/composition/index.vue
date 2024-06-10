<template>
  <NuxtLayout name="dashboard-page">
    <template #actions>
      <NuxtLink v-if="hasPermission(/^create:term(:composition)?/)" to="/dashboard/composition/create" class="button button-lg button-accent-mid hover:button-accent-light">
        Add term
      </NuxtLink>
    </template>

    <div class="space-y-12">
      <nav class="flex flex-row">
        <NuxtLink :to="`${$route.path}?type=fossil`" class="dark:bg-accent-dark/10 hover:dark:bg-accent-dark/20 w-1/2 py-4 text-center text-lg" :class="{ 'border-accent-mid dark:bg-accent-dark/20 border-b-4': type === `fossil` }">
          Fossil
        </NuxtLink>
        <NuxtLink :to="`${$route.path}?type=rock`" class="dark:bg-accent-dark/10 hover:dark:bg-accent-dark/20 w-1/2 py-4 text-center text-lg" :class="{ 'border-accent-mid dark:bg-accent-dark/20 border-b-4': type === `details` }">
          Rock
        </NuxtLink>
      </nav>
    </div>

    <div class="relative flex flex-row">
      <TwFormField label="Search" label-class="sr-only" class="w-full">
        <TwInputSearch v-model="search" class="input input-text-md w-full" text-wrapper-class="w-full" />
      </TwFormField>
    </div>

    <EntityTable
      v-model="selection"
      :entities="terms"
      :columns="schema.filter(({ id }) => [`label`].includes(id)).map(({ id, label }) => [id, label])"
      :multi-select="true"
      class="w-full"
      row-class="table-row"
      selected-row-class="active"
    >
      <template #label="{ entity: { label, slug} }">
        <NuxtLink v-if="hasPermission(/^update:term(:composition)?:/)" :to="`/dashboard/composition/${slug}`" class="hover:underline">
          {{ label }}
        </NuxtLink>
      </template>
    </EntityTable>
    <div class="flex w-full flex-row justify-between px-4">
      <span v-if="list?.total" class="italic">
        {{ (page - 1) * pageSize + 1 }} - {{ Math.min(list?.total ?? 0, page * pageSize) }} of {{ pluralize(list?.total ?? 0, `term`, `terms`) }}
      </span>
      <PvPaginator v-model="page" :total="Math.ceil((list?.total ?? 0) / pageSize)" :size="pageSize" />
    </div>

    <template #sidebar>
      <EntityAdminSidebar v-if="selection.length" :entities="selection">
        <PvEntityDetails v-if="selection.length === 1" :entity="selection[0]" :fields="schema.map(({ id, label }) => [id, label])" class="space-y-4" label-class="font-bold italic" />
        <template #actions>
          <div class="space-y-2">
            <button v-if="hasPermission(/^update:term(:composition(:fossil|rock)?)?:/) && selection.length === 1" class="button button-lg button-outline-yellow-light hover:button-yellow-light hover:text-primary w-full">
              Edit{{ selection.length > 1 ? ` ${selection.length} terms` : `` }}
            </button>
            <button v-if="hasPermission(/^delete:term(:composition(:fossil|rock)?)?:/)" class="button button-lg button-outline-red-dark hover:button-red-dark w-full" @click.stop.prevent="onClickDelete">
              Delete{{ selection.length > 1 ? ` ${selection.length} terms` : `` }}
            </button>
          </div>
        </template>
      </EntityAdminSidebar>
      <span v-else>No term selected.</span>
    </template>
  </NuxtLayout>
</template>

<script setup lang="tsx">
import { FilterOperator } from '@unb-libraries/nuxt-layer-entity'
import { type Composition } from '~/types/composition'
import { PvEntityDeleteConfirm } from '#components'

definePageMeta({
  name: `Composition`,
  layout: false,
  auth: {
    redirect: true,
    permission: /^(create|update|delete):term(:composition(:fossil)?)?/,
  },
  menu: {
    weight: 100,
  },
})

const type = ref(useRoute().query.type)
if (!type.value) {
  navigateTo(`${useRoute().path}?type=fossil`)
}

onUpdated(() => {
  type.value = useRoute().query.type
  filter.value = [[`type`, FilterOperator.EQUALS, `composition/${type.value}`]]
})

const { hasPermission } = useCurrentUser()
const { values: schema, keys } = defineEntitySchema<Composition>(`Composition`, [`label`, `slug`, `created`, `updated`, `status`], {
  fieldPermission: id => new RegExp(`read:term(:composition(:${type.value}))?:(${id}|\\*)`),
})

const selection = ref<Composition[]>([])
const { entities: terms, list, query: { filter, page, pageSize, search }, remove, removeMany } = await fetchEntityList<Composition>(`Term`, {
  select: keys,
  sort: [`label`],
  filter: [[`type`, FilterOperator.EQUALS, `composition/${type.value}`]],
})

const { setContent, close: closeModal } = useModal()
const onClickDelete = () => {
  const label = selection.value.length > 1 ? `${selection.value.length} term` : `the term "${selection.value[0].label}"`
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
