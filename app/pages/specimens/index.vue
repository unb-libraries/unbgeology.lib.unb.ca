<template>
  <div class="flex-col flex h-full">
    <div class="sticky top-[10rem] pb-2 space-y-2 z-30 bg-base dark:bg-base-2">
      <!-- <div class="flex justify-between items-center space-x-2">
        <a v-if="total > 0 && page !== 0" class="flex-none py-1">
          Displaying {{ (page - 1) * pageSize + 1 }} - {{ (page - 1) * pageSize + specimens.length }} of {{ list?.total }} specimens
        </a>
        <TwPageIndex v-if="mode !== 'map'"
          :page="page"
          :total="Math.ceil((list?.total ?? 0) / pageSize)"
          :size="5"
          @change="(index) => { page = index }" class="flex justify-end flex-none"
        />
      </div> -->
      <div class="flex-none space-x-1 w-full flex">
        <div class="form-field grow">
          <label class="sr-only" for="search">Search</label>
          <InputSearch v-model="search" :timeout="600" :disabled="pending" class="shadow-none" />
        </div>
        <button
          :data-active="!sidebarCollapsed ? '' : undefined"
          class="inline-flex xl:hidden space-x-1 p-2 justify-center hover:border-accent-26 hover:text-accent-26 data-[active]:bg-base-17 data-[active]:border-base-17 uppercase font-semibold data-[active]:hover:bg-accent-26 data-[active]:hover:border-accent-26 data-[active]:text-base-97 items-center border border-base-17 rounded-md flex-none cursor-pointer"
          @click.prevent.stop="sidebarCollapsed = !sidebarCollapsed"
        >
          <IconFilter class="fill-none stroke-current size-6 stroke-1.5" />
          <span>Filter</span>
        </button>
        <button v-for="m in ['list', 'grid', 'map']" :key="m"
          :data-active="mode === m ? '' : undefined"
          :disabled="mode === m"
          class="inline-flex space-x-1 p-2 justify-center border border-base-17 data-[active]:border-base-17 hover:border-accent-26 data-[active]:hover:border-base-17 dark:border-base-77 dark:data-[active]:border-base-77 dark:hover:border-accent-36 dark:data-[active]:hover:border-base-77 rounded-md data-[active]:text-base-97 hover:text-accent-26 data-[active]:hover:text-base-97 dark:data-[active]:text-base-7 dark:hover:text-accent-36 dark:data-[active]:hover:text-base-7 data-[active]:bg-base-17 dark:data-[active]:bg-base-77 uppercase font-semibold data-[active]:cursor-default items-center flex-none cursor-pointer"
          @click.prevent.stop="mode = m"
        >
          <component :is="{ list: IconList, grid: IconGrid, map: IconMap }[m as 'list' | 'grid' | 'map']" class="fill-none stroke-current size-6 stroke-1.5" />
          <span>{{ m.charAt(0).toUpperCase() + m.slice(1) }}</span>
        </button>
      </div>
    </div>
    <div class="flex flex-col xl:flex-row grow gap-x-6">
      <!-- <template v-if="list?.total"> -->
        <SearchViewFacets
          :collapsed="sidebarCollapsed"
          @toggled="sidebarCollapsed = $event"
        />
        <div class="w-full xl:w-4/5 h-full relative">
          <SearchView :mode @refresh="total = $event[0], page = $event[1], pageSize = $event[2]" />
        </div>
      <!-- </template> -->
      <!-- <div v-else class="p-4">
        No specimens found
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconList, IconGrid, IconMap, SearchViewFacets } from '#components'
import { useRouteQuery } from '@vueuse/router'

definePageMeta({
  layout: 'page',
  name: 'Search',
})

const mode = useRouteQuery('mode', 'list')
const search = useRouteQuery('search', '')
const sidebarCollapsed = ref(true)
</script>