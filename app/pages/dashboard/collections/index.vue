<template>
  <NuxtLayout name="dashboard-page">
    <template #actions>
      <NuxtLink v-if="hasPermission(/^create:term(:collection)?/)" to="/dashboard/collections/create" class="button button-lg button-accent-mid hover:button-accent-light">
        Add collection
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
      :columns="schema.filter(({ id }) => [`label`, `slug`].includes(id)).map(({ id, label }) => [id, label])"
      :multi-select="true"
      class="w-full"
      row-class="table-row"
      selected-row-class="active"
    >
      <template #label="{ entity: { label, slug} }">
        <NuxtLink v-if="hasPermission(/^update:term(:collection)?:/)" :to="`/dashboard/collections/${slug}`" class="hover:underline">
          {{ label }}
        </NuxtLink>
      </template>
    </EntityTable>
    <div class="flex w-full flex-row justify-between px-4">
      <span v-if="list?.total" class="italic">
        {{ (page - 1) * pageSize + 1 }} - {{ Math.min(list?.total ?? 0, page * pageSize) }} of {{ pluralize(list?.total ?? 0, `collection`, `collections`) }}
      </span>
      <PvPaginator v-model="page" :total="Math.ceil((list?.total ?? 0) / pageSize)" :size="pageSize" />
    </div>

    <template #sidebar>
      <EntityAdminSidebar v-if="selection.length" :entities="selection">
        <PvEntityDetails v-if="selection.length === 1" :entity="selection[0]" :fields="schema.map(({ id, label }) => [id, label])" class="space-y-4" label-class="font-bold italic" />
        <template #actions>
          <div class="space-y-2">
            <button v-if="hasPermission(/^update:term(:collection)?:/) && selection.length === 1" class="button button-lg button-outline-yellow-light hover:button-yellow-light hover:text-primary w-full">
              Edit{{ selection.length > 1 ? ` ${selection.length} collections` : `` }}
            </button>
            <button v-if="hasPermission(/^delete:term(:collection)?:/)" class="button button-lg button-outline-red-dark hover:button-red-dark w-full" @click.stop.prevent="onClickDelete">
              Delete{{ selection.length > 1 ? ` ${selection.length} collections` : `` }}
            </button>
          </div>
        </template>
      </EntityAdminSidebar>
      <span v-else>No collection selected.</span>
    </template>
  </NuxtLayout>
</template>

<script setup lang="tsx">
import { FilterOperator } from '@unb-libraries/nuxt-layer-entity'
import { type Collection } from '~/types/collection'
import { PvEntityDeleteConfirm } from '#components'

definePageMeta({
  name: `Collections`,
  layout: false,
  auth: {
    redirect: true,
    permission: /^(create|update|delete):term(:collection)?/,
  },
  menu: {
    weight: 20,
  },
})

const { hasPermission } = useCurrentUser()
const { values: schema, keys } = defineEntitySchema<Collection>(`Collection`, [`label`, `slug`, `created`, `updated`, `status`], {
  fieldPermission: id => new RegExp(`read:term(:collection)?:(${id}|\\*)`),
})

const selection = ref<Collection[]>([])
const { entities: terms, list, query: { page, pageSize, search }, remove, removeMany } = await fetchEntityList<Collection>(`Term`, {
  select: keys,
  sort: [`label`],
  filter: [[`type`, FilterOperator.EQUALS, `collection`]],
})

const { setContent, close: closeModal } = useModal()
const onClickDelete = () => {
  const label = selection.value.length > 1 ? `${selection.value.length} collections` : `the collection "${selection.value[0].label}"`
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
