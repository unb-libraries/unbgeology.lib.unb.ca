<template>
  <NuxtLayout name="dashboard-page">
    <template #actions>
      <NuxtLink v-if="hasPermission(/^create:term(:affiliate(:organization)?)?/)" to="/dashboard/collectors-sponsors/organizations/create" class="button button-lg button-accent-mid hover:button-accent-light">
        Add Organization
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
      :columns="schema.filter(({ id }) => [`label`, `address`].includes(id)).map(({ id, label }) => [id, id === `address` ? `City` : label])"
      :multi-select="true"
      class="w-full"
      row-class="table-row"
      selected-row-class="active"
    >
      <template #label="{ entity: { label, slug } }">
        <div class="inline-flex items-center space-x-3">
          <NuxtLink v-if="hasPermission(/^update:term(:affiliate(:organization)?)?:/)" :to="`/dashboard/collectors-sponsors/organizations/${slug}`" class="hover:underline">
            {{ label }}
          </NuxtLink>
        </div>
      </template>
      <template #address="{ entity: { address }}">
        {{ address?.city }}
      </template>
    </EntityTable>
    <div class="flex w-full flex-row justify-between px-4">
      <span v-if="list?.total" class="italic">
        {{ (page - 1) * pageSize + 1 }} - {{ Math.min(list?.total ?? 0, page * pageSize) }} of {{ pluralize(list?.total ?? 0, `organization`, `organizations`) }}
      </span>
      <PvPaginator v-model="page" :total="Math.ceil((list?.total ?? 0) / pageSize)" :size="pageSize" />
    </div>

    <template #sidebar>
      <EntityAdminSidebar v-if="selection.length" :entities="selection">
        <PvEntityDetails v-if="selection.length === 1" :entity="selection[0]" :fields="schema.map(({ id, label }) => [id, label])" class="space-y-4" label-class="font-bold italic">
          <template #web="{ value: urls }">
            <div class="flex flex-col">
              <a v-for="url in urls" :key="url" :href="url" class="italic underline">{{ url }}</a>
            </div>
          </template>
          <template #contact="{ value: contact }">
            <div v-if="contact" class="flex flex-col">
              <span>{{ contact.name }}</span>
              <span>{{ contact.email }}</span>
              <span>{{ contact.phone }}</span>
            </div>
          </template>
          <template #address="{ value: address }">
            <div v-if="address" class="flex flex-col">
              <span>{{ address.line1 }}</span>
              <span v-if="address.line2">{{ address.line2 }}</span>
              <span>{{ address.city }}, {{ address.state }}, {{ address.postalCode }}</span>
              <span>{{ address.country }}</span>
            </div>
          </template>
          <template #status="{ value: status }">
            {{ titleCased(useEnum(Status).labelOf(status)) }}
          </template>
        </PvEntityDetails>
        <template #actions>
          <div class="space-y-2">
            <button v-if="hasPermission(/^delete:term(:affiliate(:organization)?)?:/)" class="button button-lg button-outline-red-dark hover:button-red-dark w-full" @click.stop.prevent="onClickDelete">
              Delete{{ selection.length > 1 ? ` ${selection.length} organizations` : `` }}
            </button>
          </div>
        </template>
      </EntityAdminSidebar>
      <span v-else>No organization selected.</span>
    </template>
  </NuxtLayout>
</template>

<script setup lang="tsx">
import { FilterOperator } from '@unb-libraries/nuxt-layer-entity'
import { type Organization, Status } from '~/types/affiliate'
import { PvEntityDeleteConfirm } from '#components'

definePageMeta({
  name: `Organizations`,
  layout: false,
  auth: {
    redirect: true,
    permission: /^(create|update|delete):term(:affiliate(:organization)?)?/,
  },
  menu: {
    weight: 70,
  },
})

const { hasPermission } = useCurrentUser()
const { values: schema, keys } = defineEntitySchema<Organization>(`Organization`, [`label`, `slug`, `web`, `contact`, `address`, `created`, `updated`, `status`], {
  fieldPermission: id => new RegExp(`read:term(:affiliate(:organization)?)?:(${id}|\\*)`),
})

const selection = ref<Organization[]>([])
const { entities: terms, list, query: { page, pageSize, search }, remove, removeMany } = await fetchEntityList<Organization>(`Term`, {
  select: keys,
  sort: [`label`],
  filter: [[`type`, FilterOperator.EQUALS, `affiliate/organization`]],
})

const { setContent, close: closeModal } = useModal()
const onClickDelete = () => {
  const label = selection.value.length > 1 ? `${selection.value.length} organizations` : `the organization "${selection.value[0].label}"`
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
