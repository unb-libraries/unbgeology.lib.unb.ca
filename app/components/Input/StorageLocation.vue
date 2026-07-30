<template>
  <PvInputTreeSelect
    v-model="selected"
    :options="locations"
    placeholder="-- Select --">
    <template v-if="value" #value="{ value }">
      {{[...value[0].ancestors?.entities.map(a => a.label).reverse() ?? '', value[0].label].filter(Boolean).join(' &raquo; ')}}
    </template>
  </PvInputTreeSelect>
</template>

<script lang="ts" setup>
import { FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import type { StorageLocation } from "~~/types/storagelocation"

const value = defineModel<string>({ required: false })
const emit = defineEmits()
const locations = ref<StorageLocation[]>([])

const selected = computed({
  get: () => Object.fromEntries([[value.value, true]]),
  set: (value: Record<string, boolean>) => emit('update:modelValue', Object.keys(value)[0]),
})

let allLoaded = false
let page = 1
while (!allLoaded) {
  const { list, entities } = await fetchEntityList<StorageLocation>(`Term`, {
    filter: [[`type`, FilterOperator.EQUALS, `storageLocation`]],
    select: [`label`, `parent`, `ancestors`],
    sort: [`label`],
    page,
    pageSize: 500,
  })

  allLoaded = !list.value?.nav?.next
  page++

  locations.value.push(...entities.value)
}

const rootLocations = locations.value.filter(l => !l.parent?.self)
const mapLocations = (location: StorageLocation): StorageLocation & { key: string, children: StorageLocation[] } => {
  const children = locations.value.filter(l => l.parent?.self === location.self)
  return {
    ...location,
    key: location.self,
    children: children.map(mapLocations),
  }
}

locations.value = rootLocations.map(mapLocations)
</script>
