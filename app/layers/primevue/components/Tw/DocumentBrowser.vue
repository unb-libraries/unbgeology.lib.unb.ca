<template>
  <div class="flex h-full flex-col space-y-8">
    <div class="flex h-full grow flex-col space-y-4">
      <EntityTable
        v-model="selection"
        :entities="documents"
        :columns="[`filename`, [`created`, `Uploaded on`]]"
        class="border-primary-60/75 w-full border-b"
        header-cell-class="group"
        row-class="table-row"
        selected-row-class="active"
      >
        <template #filename="{ entity: { filename } }">
          {{ filename.slice(filename.indexOf(`-`) + 1) }}
        </template>
        <template #created="{ entity: { created } }">
          {{ new Date(created).toLocaleString() }}
        </template>
      </EntityTable>
      <div class="flex h-fit flex-row justify-between">
        <div
          v-if="list?.total"
          class="italic"
        >
          Displaying {{ (page - 1) * pageSize + 1 }} - {{ Math.min(list?.total, page * pageSize) }} of {{ pluralize(list.total, `document`, `documents`) }}
        </div>
        <div v-else>
          No documents found
        </div>
        <TwPageIndex
          :page="page"
          :size="5"
          :total="pages"
          @change="newPage => page = newPage"
        />
      </div>
    </div>
    <TwFileUpload @upload="refresh" />
  </div>
</template>

<script lang="ts" setup>
import { FilterOperator, type Document } from "@unb-libraries/nuxt-layer-entity"

const selection = defineModel<Document>()
const { list, entities: documents, query: { page, pageSize }, refresh } = await fetchEntityList<Document>(`File`, {
  filter: [[`type`, FilterOperator.EQUALS, `document`]],
  sort: [`-created`],
  pageSize: 50,
})
const pages = computed(() => Math.ceil((list.value?.total ?? 0) / pageSize.value))
</script>
