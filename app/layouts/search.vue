<template>
  <NuxtLayout name="page">
    <div class="flex-col flex h-full">
      <div class="sticky top-0 pb-2 z-10 space-y-2 bg-base dark:bg-base-2">
        <div class="flex justify-between items-center space-x-2 pt-2">
          <span class="flex-none py-1 leading-none">
            <slot v-if="total" name="summary" />
            <template v-else>No specimens found.</template>
          </span>
          <TwPageIndex v-if="total && page && pageSize"
            :page="page"
            :total="Math.ceil(total / pageSize)"
            :size="5"
            class="flex justify-end flex-none leading-none"
            @change="$emit('paginate', $event)"
          />
        </div>
        <div class="flex-none gap-1 w-full flex flex-col lg:flex-row">
          <div class="flex w-full lg:grow gap-x-1">
            <div class="form-field grow">
              <label class="sr-only" for="search">Search</label>
              <InputSearch v-model="search" :timeout="600" :disabled="pending" class="shadow-none" />
            </div>
            <button
              :data-active="!sidebarCollapsed ? '' : undefined"
              class="xl:hidden inline-flex space-x-1 p-2 justify-center border border-base-17 data-[active]:border-base-17 hover:border-accent-26 data-[active]:hover:border-base-17 dark:border-base-77 dark:data-[active]:border-base-77 dark:hover:border-accent-36 dark:data-[active]:hover:border-base-77 rounded-md data-[active]:text-base-97 hover:text-accent-26 data-[active]:hover:text-base-97 dark:data-[active]:text-base-7 dark:hover:text-accent-36 dark:data-[active]:hover:text-base-7 data-[active]:bg-base-7 dark:data-[active]:bg-base-77 uppercase font-semibold data-[active]:cursor-default items-center flex-none cursor-pointer"
              @click.prevent.stop="sidebarCollapsed = !sidebarCollapsed"
            >
              <IconFilter class="fill-none stroke-current size-6 stroke-1.5" />
              <span>Filter</span>
            </button>
          </div>
          <div class="flex flex-none w-full lg:w-fit gap-x-1">
            <button v-for="m in ['list', 'grid', 'map']" :key="m"
              :data-active="mode === m ? '' : undefined"
              :disabled="mode === m"
              class="inline-flex grow lg:flex-none space-x-1 p-2 justify-center border border-base-17 data-[active]:border-base-17 hover:border-accent-26 data-[active]:hover:border-base-17 dark:border-base-77 dark:data-[active]:border-base-77 dark:hover:border-accent-36 dark:data-[active]:hover:border-base-77 rounded-md data-[active]:text-base-97 hover:text-accent-26 data-[active]:hover:text-base-97 dark:data-[active]:text-base-7 dark:hover:text-accent-36 dark:data-[active]:hover:text-base-7 data-[active]:bg-base-7 dark:data-[active]:bg-base-77 uppercase font-semibold data-[active]:cursor-default items-center flex-none cursor-pointer"
              @click.prevent.stop="mode = (m as Mode)"
            >
              <component :is="{ list: IconList, grid: IconGrid, map: IconMap }[m as 'list' | 'grid' | 'map']" class="fill-none stroke-current size-6 stroke-1.5" />
              <span>{{ m.charAt(0).toUpperCase() + m.slice(1) }}</span>
            </button>
          </div>
        </div>
      </div>
      <div class="flex flex-col xl:flex-row h-full gap-x-6">
        <Facets
          :collapsed="sidebarCollapsed"
          @toggled="sidebarCollapsed = $event"
        />
        <div class="w-full xl:w-4/5 h-full relative">
          <slot />
          <div v-if="routeUpdating && !pending" class="flex justify-center size-full absolute top-0 left-0 py-24 dark:bg-base-7/90">
            <IconSpinner class="relative size-16 fill-none stroke-2 stroke-current animate-spin" />
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import { IconList, IconGrid, IconMap } from '#components'
import { useRouteQuery } from '@vueuse/router'

defineProps<{
  total: number
  page?: number
  pageSize?: number
  pending?: boolean
}>()

defineEmits<{
  paginate: [page: number]
}>()

type Mode = 'list' | 'grid' | 'map'
const mode = useRouteQuery<Mode>('mode', 'list')
const sidebarCollapsed = ref(true)
const search = useRouteQuery('search', '')

const routeUpdating = ref(false)
onBeforeRouteUpdate(() => {
  routeUpdating.value = true
})
onUpdated(() => {
  routeUpdating.value = false
})
</script>