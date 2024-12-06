<template>
  <NuxtLayout name="dashboard-page">
    <template #actions>
      <NuxtLink
        v-if="hasPermission(/^create:loan/)"
        to="/dashboard/loans/create"
        class="button button-lg button-accent-mid hover:button-accent-light"
      >
        Add loan
      </NuxtLink>
    </template>

    <EntityTable
      v-model="selection"
      :entities="loans"
      :columns="[['id', 'ID'], 'start', 'end', 'type', ['specimens', '#Specimens']]"
      :multi-select="true"
      class="border-primary-60/75 w-full border-b"
      header-cell-class="group"
      row-class="table-row"
      selected-row-class="active"
    >
      <template #id="{ entity: loan }">
        <NuxtLink
          :to="`/dashboard/loans/${loan.id}`"
          class="hover:underline"
        >
          {{ loan.id }}
        </NuxtLink>
      </template>
      <template #start="{ entity: { start } }">
        {{ new Date(start).toISOString().slice(0, 10) }}
      </template>
      <template #end="{ entity: { end } }">
        {{ new Date(end).toISOString().slice(0, 10) }}
      </template>
      <template #specimens="{ entity: { specimens } }">
        {{ specimens.length }}
      </template>
    </EntityTable>
    <div class="flex w-full flex-row justify-between px-4">
      <span
        v-if="list?.total"
        class="italic"
      >
        {{ (page - 1) * pageSize + 1 }} - {{ Math.min(list?.total ?? 0, page * pageSize) }} of {{ pluralize(list?.total ?? 0, `loan`, `loans`) }}
      </span>
      <TwPageIndex
        :page="page"
        :total="Math.ceil((list?.total ?? 0) / pageSize)"
        :size="5"
        @change="(index) => { page = index }"
      />
    </div>

    <template #sidebar>
      <EntityAdminSidebar
        :entities="selection"
      >
        <PvEntityDetails
          v-if="selection.length === 1"
          :entity="selection[0]"
          :fields="columns"
          class="space-y-4"
          label-class="font-bold italic"
        >
          <template #start="{ entity: { start } }">
            {{ new Date(start).toLocaleDateString() }}
          </template>
          <template #end="{ entity: { end } }">
            {{ new Date(end).toLocaleDateString() }}
          </template>
          <template #specimens="{ entity: { specimens } }">
            <ul>
              <li
                v-for="specimen in specimens"
                :key="specimen.id"
              >
                <NuxtLink :to="`/dashboard/specimens/${specimen.id}`">
                  {{ specimen.id.toUpperCase() }}
                </NuxtLink>
              </li>
            </ul>
          </template>
          <template #contact="{ entity: { contact } }">
            <div class="flex flex-col">
              <span>{{ contact.name }}</span>
              <span>{{ contact.affiliation }}</span>
              <span>{{ contact.email }}</span>
              <span>{{ contact.phone }}</span>
            </div>
          </template>
          <template #contract="{ entity: { contract } }">
            <a
              v-if="contract"
              :href="contract.uri"
              target="_blank"
              class="hover:underline"
            >{{ contract.filename.slice(contract.filename.indexOf(`-`) + 1) }}</a>
            <span v-else>Nothing attached</span>
          </template>
        </PvEntityDetails>
        <div v-else-if="selection.length > 1">
          {{ pluralize(selection.length, `loan`, `loans`) }} selected
        </div>
        <template #actions>
          <div class="space-y-2">
            <button
              v-if="hasPermission(/^delete:loan/)"
              class="button button-lg button-outline-red-dark hover:button-red-dark w-full"
              @click.stop.prevent="onClickRemove"
            >
              Delete
            </button>
          </div>
        </template>
      </EntityAdminSidebar>
    </template>
  </NuxtLayout>
</template>

<script setup lang="tsx">
import type { EntityJSON } from "@unb-libraries/nuxt-layer-entity"
import { PvEntityDeleteConfirm } from "#components"
import type { Loan } from "~/types/loan"

definePageMeta({
  layout: false,
  name: `Loans`,
  auth: {
    redirect: true,
    permission: /^(update|delete):loan/,
  },
  menu: {
    weight: 110,
  },
})

const { hasPermission } = useCurrentUser()
const { setContent, close: closeModal } = useModal()
const { createToast } = useToasts()

const { entities: loans, list, removeMany, error, query: { page, pageSize } } = await fetchEntityList<Loan>(`Loan`)
const columns: [keyof Loan, string][] = [[`id`, `ID`], [`start`, `Start`], [`end`, `End`], [`type`, `Type`], [`specimens`, `Specimens`], [`contact`, `Contact`], [`contract`, `Contract`]]
const selection = ref<EntityJSON<Loan>[]>([])

function onClickRemove() {
  const label = pluralize(selection.value.length, `loan`, `loans`)
  setContent(() => <PvEntityDeleteConfirm label={label} onConfirm={onRemove} onCancel={closeModal} />)
}

async function onRemove() {
  const count = selection.value.length
  await removeMany(selection.value!)
  if (error.value) {
    createToast(`loan-delete-error`, () => error.value, { type: `error` })
  } else {
    createToast(`loan-delete-success`, () => `Deleted ${pluralize(count, `loan`, `loans`)}`, { type: `success`, duration: 4000 })
  }
  selection.value = []
  closeModal()
}
</script>
