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
    <template #item="{ options: [option, name, selected] }">
      <div class="flex flex-col">
        <span>{{ name }}</span>
        <span class="group-hover:text-primary-80 text-xs italic" :class="{ 'text-primary-20': !selected, 'text-primary-80': selected }">
          {{ locations.find(op => op.self === option)?.ancestors?.entities.map(acs => acs.label).reverse().join(` &raquo; `) ?? `&nbsp;` }}
        </span>
      </div>
    </template>
  </PvInputDropdown>
</template>

<script lang="ts" setup>
import { FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import type { StorageLocation } from "~/types/storagelocation"

const value = defineModel<string>({ required: false })
const { entities: locations } = await fetchEntityList<StorageLocation>(`Term`, {
  filter: [[`type`, FilterOperator.EQUALS, `storageLocation`]],
  select: [`label`, `ancestors`],
  sort: [`label`],
  pageSize: 500,
})
</script>
