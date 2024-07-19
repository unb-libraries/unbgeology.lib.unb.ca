<template>
  <NuxtLayout name="dashboard-page">
    <template #actions>
      <NuxtLink v-if="hasPermission(/^create:specimen/)" to="/dashboard/specimens/create" class="button button-lg button-accent-mid hover:button-accent-light">
        Add specimen
      </NuxtLink>
    </template>

    <div class="form-field w-full">
      <label class="sr-only" for="search">Search</label>
      <input v-model="search" placeholder="Search" name="search" class="placeholder:text-primary dark:placeholder:text-primary-20 form-input form-input-text grow p-2 placeholder:italic">
    </div>
    <div class="mt-2 flex w-full flex-row items-center justify-between">
      <div v-if="list?.total" class="italic">
        Displaying {{ (page - 1) * pageSize + 1 }} - {{ Math.min(list?.total, page * pageSize) }} of {{ pluralize(list?.total, `specimen`, `specimens`) }}
      </div>
      <div v-else>
        No specimens found
      </div>
      <PvPaginator v-model="page" :total="Math.ceil((list?.total ?? 0) / pageSize)" :size="5" />
      <div class="relative flex items-center space-x-2">
        <button id="button-filter" class="button bg-primary-80/40 hover:bg-primary-60/40 button-md inline-flex space-x-2" @click.stop.prevent="filterMenuVisible = !filterMenuVisible">
          <IconFilter class="stroke-1.5 h-6 w-6 fill-none stroke-current" /><span>Filter<template v-if="filter.length"> ({{ filter.length }})</template></span>
        </button>
        <button id="button-sort" class="button bg-primary-80/40 hover:bg-primary-60/40 button-md inline-flex space-x-2" @click.prevent="sortMenuVisible = !sortMenuVisible">
          <IconSort class="stroke-1.5 h-6 w-6 fill-none stroke-current" /><span>Sort<template v-if="activeSortOptions.length"> ({{ activeSortOptions.length }})</template></span>
        </button>
        <button id="button-columns" class="button bg-primary-80/40 hover:bg-primary-60/40 button-md inline-flex space-x-2" @click.prevent="columnMenuVisible = !columnMenuVisible">
          <IconTable class="stroke-1.5 h-6 w-6 fill-none stroke-current" /><span>Columns ({{ columnsOptions.filter(([id, label, selected]) => selected).length }}/{{ columnsOptions.length }})</span>
        </button>

        <PvContextualDropdown v-model="filterMenuVisible" trigger-id="button-filter" class="bg-primary border-primary-60/40 right-0 top-12 w-96 rounded-md border p-6" @click.prevent.stop="filterMenuVisible = !filterMenuVisible">
          <div class="space-y-3">
            <TwFormField label="Category">
              <PvInputDropdown v-model="categoryFilter" :options="categoryOptions" class="input-select-md" />
            </TwFormField>
            <div class="inline-flex space-x-2">
              <button type="submit" class="button button-accent-mid :hover:button-accent-light button-md" @click.prevent="filter = (categoryFilter && [[`type`, FilterOperator.EQUALS, categoryFilter]]) || []">
                Apply
              </button>
              <button class="button button-md hover:bg-primary-80/60" @click.prevent="filter = []">
                Reset
              </button>
            </div>
          </div>
        </PvContextualDropdown>

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

        <PvContextualDropdown v-model="columnMenuVisible" trigger-id="button-columns" class="bg-primary border-primary-60/40 right-0 top-12 w-96 rounded-md border p-4">
          <div class="form-field max-h-96 overflow-y-scroll">
            <ul class="space-y-1">
              <li v-for="column in columnsOptions" :key="(column[0])" class="bg-primary-80/40 flex w-full flex-row rounded-sm px-3 py-1">
                <PvCheckbox
                  :id="`column-${column[0]}`"
                  v-model="column[2]"
                  :label="column[1]"
                  :name="`column-${column[0]}`"
                  class="rounded-lg p-1"
                />
              </li>
            </ul>
          </div>
        </PvContextualDropdown>
      </div>
    </div>

    <EntityTable
      v-model="selection"
      class="border-primary-60/75 w-full border-b"
      header-cell-class="group"
      row-class="table-row"
      :entities="specimens"
      :columns="columnsOptions.filter(([,, selected]) => selected).map(([id, label]) => [id, label])"
      :multi-select="true"
      selected-row-class="active"
    >
      <template #id="{ entity: specimen }">
        <NuxtLink :to="`/dashboard/specimens/${specimen.id.toLowerCase()}`" class="hover:underline" @click.stop="">
          {{ specimen.id.toUpperCase() }}
        </NuxtLink>
      </template>
      <template #mimsyID="{ entity: { mimsyID } }">
        <template v-if="mimsyID">
          {{ mimsyID }}
        </template>
      </template>
      <template #type="{ entity: specimen }">
        {{ sentenceCased(specimen.type) }}
      </template>
      <template #classification="{ entity: specimen }">
        <template v-if="specimen.classification">
          {{ specimen.classification.label }}
        </template>
      </template>
      <template #images="{ entity: specimen }">
        <img
          v-if="specimen.images?.total > 0"
          :src="specimen.images?.entities[0].uri"
          width="60"
          height="60"
          class="aspect-square rounded-md object-cover"
        >
        <div v-else />
      </template>
      <template #collection="{ entity: { collection } }">
        {{ collection?.label }}
      </template>
      <template #measurements="{ entity: { measurements } }">
        <ol v-if="measurements?.dimensions">
          <li v-for="(lwh, index) in measurements.dimensions" :key="index">
            {{ lwh.map(d => `${d / 10}cm`).join(` x `) }}
          </li>
        </ol>
        <span v-else />
      </template>
      <template #partial="{ entity: { partial }}">
        <template v-if="partial">
          Partial
        </template>
        <template v-else>
          Whole
        </template>
      </template>
      <template #portion="{ entity: fossil }">
        <template v-if="(fossil as Fossil).portion">
          {{ (fossil as Fossil).portion.label }}
        </template>
      </template>
      <template #composition="{ entity: specimen }">
        <template v-if="[`fossil`, `rock`].includes(specimen.type)">
          {{ (specimen as Fossil | Rock).composition?.entities.map(({ label }) => label).join(`, `) }}
        </template>
        <template v-else>
          {{ (specimen as Mineral).classification?.composition }}
        </template>
      </template>
      <template #age="{ entity: { age }}">
        <template v-if="age?.unit">
          {{ age?.unit?.label }}
          <template v-if="age.numeric">
            ({{ age.numeric / 1e6 }} mya)
          </template>
        </template>
        <template v-else-if="age?.numeric">
          {{ age.numeric / 1e6 }} mya
        </template>
      </template>
      <template #origin="{ entity: { origin }}">
        {{ origin?.name }}
      </template>
      <template #collector="{ entity: { collector }}">
        {{ collector?.label }}
      </template>
      <template #sponsor="{ entity: { sponsor }}">
        {{ sponsor?.label }}
      </template>
      <template #appraisal="{ entity: { appraisal }}">
        <template v-if="appraisal">
          $CAD {{ `${appraisal}`.split(``).reverse().join(``).match(/\d{1,3}/g)!.join(',').split(``).reverse().join(``) }}
        </template>
      </template>
      <template #legal="{ entity: { legal }}">
        {{ sentenceCased(useEnum(Legal).labelOf(legal)) }}
      </template>
      <template #storage="{ entity: { storage }}">
        <!-- TODO: Indicate if item is on loan and not stored on site -->
        {{ storage?.at(-1)?.location?.label }}
      </template>
      <template #creator="{ entity: { creator }}">
        <template v-if="creator?.profile?.firstName && creator.profile?.lastName">
          {{ creator?.profile?.firstName }} {{ creator?.profile?.lastName }}
        </template>
        <template v-else>
          {{ creator?.username }}
        </template>
      </template>
      <template #editor="{ entity: { editor }}">
        <template v-if="editor?.profile?.firstName && editor.profile?.lastName">
          {{ editor?.profile?.firstName }} {{ editor?.profile?.lastName }}
        </template>
        <template v-else>
          {{ editor?.username }}
        </template>
      </template>
      <template #status="{ entity: { status }}">
        {{ sentenceCased(useEnum(Status).labelOf(status)) }}
      </template>
    </EntityTable>

    <template #sidebar>
      <EntityAdminSidebar v-if="selection.length" :entities="selection">
        <SpecimenDetails v-if="selection.length === 1" :specimen="selection[0]" />
        <template #actions>
          <div class="space-y-2">
            <button v-if="hasPermission(/^delete:specimen/)" class="button button-lg button-outline-red-dark hover:button-red-dark w-full" @click.stop.prevent="onClickDelete">
              Delete{{ selection.length > 1 ? ` ${selection.length} specimens` : `` }}
            </button>
          </div>
        </template>
      </EntityAdminSidebar>
      <span v-else>No specimen selected.</span>
    </template>
  </NuxtLayout>
</template>

<script setup lang="tsx">
import { FilterOperator, type EntityJSON } from '@unb-libraries/nuxt-layer-entity'
import { type Specimen, Status, Legal, type Fossil, type Mineral, type Rock } from 'types/specimen'
import { PvEntityDeleteConfirm } from '#components'

definePageMeta({
  layout: false,
  name: `Specimens`,
  menu: {
    weight: 10,
  },
})

const { hasPermission } = useCurrentUser()
const columns = ref<[keyof Specimen, string][]>([
  [`images`, `Images`],
  [`id`, `ID`],
  [`mimsyID`, `Mimsy ID`],
  [`type`, `Category`],
  [`name`, `Name`],
  [`classification`, `Classification`],
  [`collection`, `Collection`],
  [`date`, `Date received`],
  [`pieces`, `Pieces`],
  [`measurements`, `Dimensions`],
  [`partial`, `Condition`],
  // @ts-ignore
  [`portion`, `Portion`],
  // @ts-ignore
  [`composition`, `Composition`],
  [`age`, `Age`],
  [`origin`, `Origin`],
  [`collector`, `Collected by`],
  [`sponsor`, `Sponsored by`],
  [`appraisal`, `Appraisal`],
  [`legal`, `Legal status`],
  [`storage`, `Stored at`],
  [`creator`, `Created by`],
  [`editor`, `Last edited by`],
  [`created`, `Created on`],
  [`updated`, `Updated on`],
  [`status`, `Status`],
])

const { list, entities: specimens, query, remove, removeMany } = await fetchEntityList<Specimen>(`Specimen`)

const { filter, search, page, pageSize, sort } = query

const filterMenuVisible = ref(false)

const columnMenuVisible = ref(false)
const columnsOptions = ref<[string, string, boolean][]>(columns.value.filter(([id]) => id !== `images`).map(([id, label], index) => [id, label, index < 4]))

const sortMenuVisible = ref(false)
const sortableColumIDs = [`mimsyID`, `name`, `classification`, `collection`, `pieces`, `legal`, `creator`, `editor`, `created`, `updated`]
const { options: sortedColumnIDs, sortTop, sortUp, sortReverse, remove: unsort } = useSort(columns.value.filter(([id]) => sortableColumIDs.includes(id)).map(([id]) => id))

const sortOptions = computed(() => sortedColumnIDs.filter(([id]) => columns.value.find(([colID]) => colID === id)).map<[string, string, 1 | 0 | -1]>(([id, order]) => [id, columns.value.find(([colID]) => colID === id)![1], order]))
const activeSortOptions = computed(() => sortOptions.value.filter(([_, __, direction]) => direction !== 0))
const inactiveSortOptions = computed(() => sortOptions.value.filter(([_, __, direction]) => direction === 0))

watch(sortedColumnIDs, () => {
  sort.value = sortedColumnIDs
    .filter(([id, order]) => order !== 0)
    .map(([id, order]) => `${order === -1 ? `-` : ``}${id}`)
})

const selection = ref<EntityJSON<Specimen>[]>([])

const categoryOptions = [`fossil`, `mineral`, `rock`]
const categoryFilter = ref<string>()

const { setContent, close: closeModal } = useModal()
const onClickDelete = () => {
  const label = selection.value.length > 1 ? `${selection.value.length} specimens` : `the specimen "${selection.value[0].id}"`
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
