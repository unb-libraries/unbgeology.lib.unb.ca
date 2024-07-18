<template>
  <NuxtLayout name="dashboard-page">
    <template #actions>
      <NuxtLink v-if="hasPermission(/^create:term(:affiliate(:person)?)?/)" to="/dashboard/collectors-sponsors/people/create" class="button button-lg button-accent-mid hover:button-accent-light">
        Add Person
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
      :columns="schema.map(({ id, label }) => [id, label]).filter(([id]) => ![`firstName`, `lastName`, `title`, `slug`, `status`, `created`, `updated`].includes(id))"
      :multi-select="true"
      class="w-full"
      row-class="table-row"
      selected-row-class="active"
    >
      <template #label="{ entity: { firstName, lastName, title, slug } }">
        <div class="inline-flex items-center space-x-3">
          <NuxtLink v-if="hasPermission(/^update:term(:affiliate(:person)?)?:/)" :to="`/dashboard/collectors-sponsors/people/${slug}`" class="inline-flex hover:underline">
            {{ title ? titleCased(useEnum(Title).labelOf(title).split(`_`).map(t => `${t}.`).reverse().join(` `)) + ` ${lastName}` : lastName }}, {{ firstName }}
          </NuxtLink>
        </div>
      </template>
      <template #pronouns="{ entity: { pronouns }}">
        <IconMale v-if="pronouns && useEnum(Pronouns).valueOf(pronouns) === Pronouns.HE" class="stroke-1.5 h-6 w-6 fill-current stroke-none" />
        <IconFemale v-else-if="pronouns && useEnum(Pronouns).valueOf(pronouns) === Pronouns.SHE" class="stroke-1.5 h-6 w-6 fill-current stroke-none" />
        <IconMaleFemale v-else-if="pronouns && useEnum(Pronouns).valueOf(pronouns) === Pronouns.THEY" class="stroke-1.5 h-6 w-6 fill-current stroke-none" />
        <template v-else />
      </template>
    </EntityTable>
    <div class="flex w-full flex-row justify-between px-4">
      <span v-if="list?.total" class="italic">
        {{ (page - 1) * pageSize + 1 }} - {{ Math.min(list?.total ?? 0, page * pageSize) }} of {{ pluralize(list?.total ?? 0, `person`, `people`) }}
      </span>
      <PvPaginator v-model="page" :total="Math.ceil((list?.total ?? 0) / pageSize)" :size="pageSize" />
    </div>

    <template #sidebar>
      <EntityAdminSidebar v-if="selection.length" :entities="selection">
        <PvEntityDetails v-if="selection.length === 1" :entity="selection[0]" :fields="schema.filter(({ id }) => ![`label`, `slug`].includes(id)).map(({ id, label }) => [id, label])" class="space-y-4" label-class="font-bold italic">
          <template #title="{ entity: { title }}">
            {{ title && titleCased(useEnum(Title).labelOf(title).split(`_`).map(t => `${t}.`).reverse().join(` `)) }}
          </template>
          <template #pronouns="{ entity: { pronouns }}">
            <template v-if="pronouns && useEnum(Pronouns).valueOf(pronouns) === Pronouns.HE">
              He/Him
            </template>
            <template v-else-if="pronouns && useEnum(Pronouns).valueOf(pronouns) === Pronouns.SHE">
              She/Her
            </template>
            <template v-else-if="pronouns && useEnum(Pronouns).valueOf(pronouns) === Pronouns.THEY">
              They/Them
            </template>
            <template v-else />
          </template>
          <template #status="{ value: status }">
            {{ titleCased(useEnum(Status).labelOf(status)) }}
          </template>
        </PvEntityDetails>
        <template #actions>
          <div class="space-y-2">
            <button v-if="hasPermission(/^delete:term(:affiliate(:person)?)?:/)" class="button button-lg button-outline-red-dark hover:button-red-dark w-full" @click.stop.prevent="onClickDelete">
              Delete{{ selection.length > 1 ? ` ${selection.length} people` : `` }}
            </button>
          </div>
        </template>
      </EntityAdminSidebar>
      <span v-else>No people selected.</span>
    </template>
  </NuxtLayout>
</template>

<script setup lang="tsx">
import { FilterOperator } from '@unb-libraries/nuxt-layer-entity'
import { type Person, Pronouns, Status, Title } from '~/types/affiliate'
import { PvEntityDeleteConfirm } from '#components'

definePageMeta({
  name: `People`,
  layout: false,
  auth: {
    redirect: true,
    permission: /^(create|update|delete):term(:affiliate(:person)?)?/,
  },
  menu: {
    weight: 70,
  },
})

const { hasPermission } = useCurrentUser()
const { values: schema, keys } = defineEntitySchema<Person>(`Person`, [[`label`, `Name`], [`firstName`, `First name`], [`lastName`, `Last name`], `title`, [`pronouns`, `Gender`], `occupation`, `position`, `email`, `phone`, `slug`, `status`, `created`, `updated`], {
  fieldPermission: id => new RegExp(`read:term(:affiliate(:person)?)?:(${id}|\\*)`),
})

const selection = ref<Organization[]>([])
const { entities: terms, list, query: { page, pageSize, search }, remove, removeMany } = await fetchEntityList<Person>(`Term`, {
  select: keys,
  sort: [`lastName`],
  filter: [[`type`, FilterOperator.EQUALS, `affiliate/person`]],
})

const { setContent, close: closeModal } = useModal()
const onClickDelete = () => {
  const label = selection.value.length > 1 ? `${selection.value.length} people` : `the person "${selection.value[0].label}"`
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
