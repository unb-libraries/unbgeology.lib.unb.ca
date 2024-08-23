<template>
  <PvInputDropdown
    v-model="value"
    :options="locations"
    option-field="self"
    label-field="label"
    class="input-select-lg"
    item-class="even:bg-primary-80/40 hover:even:bg-accent-mid py-1 group"
    selected-item-class="bg-accent-mid even:bg-accent-mid hover:bg-accent-light even:hover:bg-accent-light"
  >
    <template #before>
      <slot name="before" />
    </template>
    <template #item="{ options: [option, name, selected] }">
      <div class="flex flex-col">
        <span>{{ name }}</span>
        <span class="group-hover:text-primary-80 text-xs italic" :class="{ 'text-primary-20': !selected, 'text-primary-80': selected }">
          {{ (getAncestorLabels(option as string) ?? []).join(` &raquo; `) ?? `&nbsp;` }}
        </span>
      </div>
    </template>
    <template #selected-item="{ label, option }">
      {{ [...getAncestorLabels(option), label].join(` &raquo; `) ?? `&nbsp;` }}
    </template>
  </PvInputDropdown>
</template>

<script lang="ts" setup>
import { FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import type { StorageLocation } from "~/types/storagelocation"

const value = defineModel<string>({ required: false })
const locations = ref<StorageLocation[]>([])

let allLoaded = false
let page = 1
while (!allLoaded) {
  const { list, entities } = await fetchEntityList<StorageLocation>(`Term`, {
    filter: [[`type`, FilterOperator.EQUALS, `storageLocation`]],
    select: [`label`, `ancestors`],
    sort: [`label`],
    page,
    pageSize: 500,
  })

  allLoaded = !list.value?.nav?.next ?? true
  page++

  locations.value.push(...entities.value)
}

function getAncestorLabels(option: string) {
  return locations.value.find(op => op.self === option)?.ancestors?.entities.map(acs => acs.label).reverse()
}
</script>
