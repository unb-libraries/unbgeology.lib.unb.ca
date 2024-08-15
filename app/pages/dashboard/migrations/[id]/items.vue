<template>
  <NuxtLayout name="dashboard-page">
    <template #page-title>
      <span class="italic">"{{ migration!.name }}"</span> items
    </template>

    <template #actions>
      <button v-if="hasPermission(/^create:migrationitem/)" class="button button-lg button-accent-mid hover:button-accent-light" @click.prevent.stop="onAddItems">
        Add items
      </button>
    </template>

    <div class="space-y-12">
      <nav class="flex flex-row">
        <NuxtLink :to="$route.path.split(`/`).slice(0, -1).join(`/`)" class="dark:bg-accent-dark/10 hover:dark:bg-accent-dark/20 w-1/2 py-4 text-center text-lg">
          Edit
        </NuxtLink>
        <span class="dark:bg-accent-dark/10 hover:dark:bg-accent-dark/20 border-accent-mid dark:bg-accent-dark/20 w-1/2 border-b-4 py-4 text-center text-lg">Items</span>
      </nav>
      <div class="space-y-3">
        <div class="flex w-full flex-row items-center justify-between">
          <div v-if="list?.total" class="italic">
            Displaying {{ (page - 1) * pageSize + 1 }} - {{ Math.min(list?.total, page * pageSize) }} of {{ pluralize(list?.total, `item`, `items`) }}
          </div>
          <div v-else>
            No specimens found
          </div>
          <TwPageIndex :page="page" :total="Math.ceil((list?.total ?? 0) / pageSize)" :size="5" @change="(index) => { page = index }" />
          <div class="relative flex items-center space-x-2">
            <button id="button-sort" class="button bg-primary-80/40 hover:bg-primary-60/40 button-md inline-flex space-x-2" @click.prevent="sortMenuVisible = !sortMenuVisible">
              <IconSort class="stroke-1.5 size-6 fill-none stroke-current" /><span>Sort<template v-if="activeSortOptions.length"> ({{ activeSortOptions.length }})</template></span>
            </button>
            <button id="button-filter" class="button bg-primary-80/40 hover:bg-primary-60/40 button-md inline-flex space-x-2" @click.stop.prevent="filterMenuVisible = !filterMenuVisible">
              <IconFilter class="stroke-1.5 size-6 fill-none stroke-current" /><span>Filter<template v-if="filter.length"> ({{ filter.length }})</template></span>
            </button>

            <PvContextualDropdown v-model="sortMenuVisible" trigger-id="button-sort" class="bg-primary border-primary-60/40 right-0 top-12 w-96 rounded-md border p-4" @click.stop.prevent="sortMenuVisible = !sortMenuVisible">
              <div class="form-field max-h-96 space-y-4 overflow-y-scroll">
                <div v-if="activeSortOptions.length > 0" class="space-y-2">
                  <h2 class="text-lg font-bold">
                    Sort by
                  </h2>
                  <ul v-if="activeSortOptions.length > 0" class="space-y-1">
                    <li v-for="([id, label, direction], index) in activeSortOptions" :key="id" class="group">
                      <div class="bg-primary-80/40 flex w-full flex-row justify-between rounded-sm px-3 py-2">
                        <div class="space-x-2">
                          <a @click.stop.prevent="">{{ label }}</a>
                          <a class="text-primary-40 cursor-pointer text-xs hover:underline" @click.stop.prevent="sortReverse(id)">{{ direction === 1 ? `ASC` : `DESC` }}</a>
                        </div>
                        <div class="invisible inline-flex space-x-2 group-hover:visible">
                          <a v-if="index > 0" class="cursor-pointer hover:underline" @click.stop.prevent="sortUp(id)">Up</a>
                          <a v-if="index > 0" class="cursor-pointer hover:underline" @click.stop.prevent="sortTop(id)">Top</a>
                          <a class="cursor-pointer hover:underline" @click.stop.prevent="unsort(id)">Remove</a>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
                <div v-if="inactiveSortOptions.length > 0" class="space-y-2">
                  <h2 class="text-lg font-bold">
                    Unsorted
                  </h2>
                  <ul class="space-y-1">
                    <li v-for="[id, label] in inactiveSortOptions" :key="id" class="group">
                      <div class="bg-primary-80/40 flex w-full flex-row justify-between rounded-sm px-3 py-2">
                        <a class="cursor-pointer hover:underline" @click.stop.prevent="sortTop(id)">{{ label }}</a>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </PvContextualDropdown>

            <PvContextualDropdown v-model="filterMenuVisible" trigger-id="button-filter" class="bg-primary border-primary-60/40 right-0 top-12 w-96 rounded-md border p-6" @click.prevent.stop="filterMenuVisible = !filterMenuVisible">
              <div class="space-y-3">
                <TwFormField label="Status">
                  <PvInputDropdown v-model="statusFilter" class="input-select-lg" :options="useEnum(MigrationItemStatus).toTuples().map(([id, label]) => [id, sentenceCased(label)])" />
                </TwFormField>
                <div class="inline-flex space-x-2">
                  <button type="submit" class="button button-accent-mid :hover:button-accent-light button-md" @click.prevent="filter = (statusFilter && [[`status`, FilterOperator.EQUALS, statusFilter]]) || []">
                    Apply
                  </button>
                  <button class="button button-md hover:bg-primary-80/60" @click.prevent="filter = []">
                    Reset
                  </button>
                </div>
              </div>
            </PvContextualDropdown>
          </div>
        </div>
        <EntityTable
          v-model="selected"
          :entities="items"
          :columns="[[`id`, `ID`], `status`, [`entityURI`, `URI`], `error`]"
          class="w-full"
          header-cell-class="group"
          row-class="table-row"
          selected-row-class="active"
        >
          <template #status="{ entity: { status }}">
            <span
              class="rounded px-1.5 py-1 text-xs uppercase"
              :class="{
                'bg-primary-20 text-primary': useEnum(MigrationItemStatus).valueOf(status) === MigrationItemStatus.INITIAL,
                'bg-red': useEnum(MigrationItemStatus).valueOf(status) === MigrationItemStatus.ERRORED,
                'bg-green text-primary': useEnum(MigrationItemStatus).valueOf(status) === MigrationItemStatus.IMPORTED,
                'bg-yellow text-primary': useEnum(MigrationItemStatus).valueOf(status) === MigrationItemStatus.PENDING,
                'bg-blue': useEnum(MigrationItemStatus).valueOf(status) === MigrationItemStatus.QUEUED,
                'bg-primary-60': useEnum(MigrationItemStatus).valueOf(status) === MigrationItemStatus.SKIPPED,
              }"
            >{{ status }}</span>
          </template>
        </EntityTable>
      </div>
    </div>

    <template #sidebar>
      <EntityAdminSidebar v-if="selected" :entities="[selected]">
        <PvEntityDetails
          :entity="selected"
          :fields="[
            [`id`, `ID`],
            [`status`, `Status`],
            useEnum(MigrationItemStatus).valueOf(selected.status) === MigrationItemStatus.ERRORED
              ? [`error`, `Error`]
              : [],
            useEnum(MigrationItemStatus).valueOf(selected.status) === MigrationItemStatus.ERRORED
              ? [`entityURI`, `URI`]
              : [],
            [`created`, `Created`],
            [`updated`, `Updated`]
          ].filter(field => field.length > 0) as [keyof MigrationItem, string][]"
          class="space-y-4"
          label-class="font-bold italic"
        >
          <template #status="{ value: status }">
            <span
              class="rounded px-1.5 py-1 text-xs uppercase"
              :class="{
                'bg-primary-20 text-primary': useEnum(MigrationItemStatus).valueOf(status) === MigrationItemStatus.INITIAL,
                'bg-red': useEnum(MigrationItemStatus).valueOf(status) === MigrationItemStatus.ERRORED,
                'bg-green text-primary': useEnum(MigrationItemStatus).valueOf(status) === MigrationItemStatus.IMPORTED,
                'bg-yellow text-primary': useEnum(MigrationItemStatus).valueOf(status) === MigrationItemStatus.PENDING,
                'bg-blue': useEnum(MigrationItemStatus).valueOf(status) === MigrationItemStatus.QUEUED,
                'bg-primary-60': useEnum(MigrationItemStatus).valueOf(status) === MigrationItemStatus.SKIPPED,
              }"
            >{{ status }}</span>
          </template>
        </PvEntityDetails>
        <template #actions>
          <div class="flex flex-col space-y-2">
            <button class="button-lg button button-outline-blue hover:button-blue w-full" @click.prevent.stop="onViewData(selected!.data)">
              Inspect
            </button>
            <button v-if="useEnum(MigrationItemStatus).valueOf(selected.status) === MigrationItemStatus.INITIAL && hasPermission(/^update:migrationitem/)" class="button-lg button button-outline-accent-mid hover:button-accent-mid w-full" @click.prevent.stop="onClickImport(selected!)">
              Import
            </button>
            <button v-if="useEnum(MigrationItemStatus).valueOf(selected.status) & (MigrationItemStatus.IMPORTED | MigrationItemStatus.ERRORED) && hasPermission(/^update:migrationitem/)" class="button-lg button button-outline-red hover:button-red w-full" @click.prevent.stop="onClickRollback(selected!)">
              Rollback
            </button>
            <button v-if="hasPermission(/^delete:migrationitem/)" class="button-lg button button-outline-red hover:button-red w-full" @click.prevent.stop="onClickDelete">
              Delete
            </button>
          </div>
        </template>
      </EntityAdminSidebar>
      <span v-else>No items selected.</span>
    </template>
  </NuxtLayout>
</template>

<script setup lang="tsx">
import { type MigrationItem, type Migration, MigrationItemStatus, FilterOperator } from '@unb-libraries/nuxt-layer-entity'
import useEntityFormModal from '~/layers/primevue/composables/useEntityFormModal'
import { FormMigrationItems, PvEntityDeleteConfirm } from '#components'

definePageMeta({
  layout: false,
  name: `Edit migration items`,
})

const { id } = useRoute().params
const { hasPermission } = useCurrentUser()
const { createToast } = useToasts()
const { setContent, close: closeModal } = useModal()

const { fetchByPK } = useEntityType<Migration>(`Migration`)
const { entity: migration } = await fetchByPK(id as string)
if (!migration) {
  throw new Error(`Migration with id ${id} not found`)
}

function onAddItems() {
  const { open } = useEntityFormModal(() => <FormMigrationItems />, {
    onSave: async (items: Pick<MigrationItem, `sourceID` | `data`>[]) => {
      const { error } = await useFetch(`/api/migrations/${id}/items`, {
        method: `POST`,
        body: items,
      })
      if (!error.value) {
        createToast(`items-added-success`, () => `Added ${items.length} items`, { type: `success`, duration: 4000 })
        refresh()
      } else {
        createToast(`items-added-error`, () => error.value!.message, { type: `error`, duration: 4000 })
      }
    },
    onCancel: () => {},
  })
  open()
}

function onViewData(data: any) {
  setContent(() => (
    <div class="bg-primary-80/20 border-primary-80 max-h-144 overflow-y-scroll border p-4 font-mono">
      <pre>{JSON.stringify(Object.fromEntries(Object.entries(data).filter(([id]) => id !== `self`)), null, 2)}</pre>
    </div>
  ))
}

async function onClickImport(item: MigrationItem) {
  const { data, error } = await useFetch<Pick<EntityJSON<MigrationItem>, `self` | `status`>>(`${item.self}/import`, {
    method: `POST`,
  })

  const { self, status } = data.value ?? {}
  if (!error.value && self && status && useEnum(MigrationItemStatus).valueOf(status) & MigrationItemStatus.INITIAL | MigrationItemStatus.PENDING) {
    const timeout = setInterval(async () => {
      const { data, error } = await useFetch<Pick<MigrationItem, `status` | `entityURI` | `error`>>(self)
      if (!error.value && data.value?.status && useEnum(MigrationItemStatus).valueOf(data.value.status) & MigrationItemStatus.IMPORTED | MigrationItemStatus.SKIPPED | MigrationItemStatus.ERRORED) {
        clearInterval(timeout)
        refresh()
      }
    }, 500)
  }
}

async function onClickRollback(item: MigrationItem) {
  const { data, error } = await useFetch<Pick<EntityJSON<MigrationItem>, `self` | `status`>>(`${item.self}/import`, {
    method: `DELETE`,
  })

  const { self, status } = data.value ?? {}
  if (!error.value && self && status && useEnum(MigrationItemStatus).valueOf(status) & ~MigrationItemStatus.INITIAL) {
    const timeout = setInterval(async () => {
      const { data, error } = await useFetch<Pick<MigrationItem, `status` | `entityURI` | `error`>>(self)
      if (!error.value && data.value?.status && useEnum(MigrationItemStatus).valueOf(data.value.status) & MigrationItemStatus.INITIAL) {
        clearInterval(timeout)
        refresh()
      }
    }, 500)
  }
}

const onClickDelete = () => {
  setContent(() => <PvEntityDeleteConfirm
    label={`the item with ID ${selected.value?.id}`}
    onConfirm={async () => {
      if (selected.value) {
        await remove(selected.value)
      }
      selected.value = undefined
      closeModal()
    }}
    onCancel={closeModal} />)
}

const { list, entities: items, query: { filter, page, pageSize, sort }, remove, refresh } = await fetchEntityList<MigrationItem>(`/api/migrations/${id}/items`)
const selected = ref<MigrationItem>()

const sortMenuVisible = ref(false)
const filterMenuVisible = ref(false)

const columns = [[`id`, `ID`], [`status`, `Status`], [`entityURI`, `URI`], [`error`, `Error`]]
const { options: sortedColumnIDs, sortTop, sortUp, sortReverse, remove: unsort } = useSort(columns.filter(([id]) => [`id`, `status`].includes(id)).map(([id]) => id))
const sortOptions = computed(() => sortedColumnIDs.filter(([id]) => columns.find(([colID]) => colID === id)).map<[string, string, 1 | 0 | -1]>(([id, order]) => [id, columns.find(([colID]) => colID === id)![1], order]))
const activeSortOptions = computed(() => sortOptions.value.filter(([_, __, direction]) => direction !== 0))
const inactiveSortOptions = computed(() => sortOptions.value.filter(([_, __, direction]) => direction === 0))
watch(sortedColumnIDs, () => {
  sort.value = sortedColumnIDs
    .filter(([id, order]) => order !== 0)
    .map(([id, order]) => `${order === -1 ? `-` : ``}${id}`)
})

const statusFilter = ref<string>()

</script>
