<template>
  <PvEntityDetails :entity="specimen!" :fields="[[`id`, `ID`], [`name`, `Object name`], [`type`, `Category`], `classification`, `created`, `updated`, `status`]" class="space-y-4" label-class="font-bold italic" item-class="space-y-1">
    <template #id="{ value: id }">
      {{ id }}
    </template>
    <template #type="{ value: category }">
      {{ titleCased(category) }}
    </template>
    <template #classification="{ entity: { classification } }">
      <div v-if="classification" class="flex flex-row items-center space-x-1.5">
        <template v-for="(term, index) in [classification, ...classification.ancestors?.entities ?? []].reverse()" :key="term.self">
          <span class="bg-primary-60/60 rounded-md px-1.5 py-0.5">
            {{ term.label }}
          </span>
          <span v-if="index < (classification.ancestors?.entities ?? []).length">&raquo;</span>
        </template>
      </div>
      <template v-else>
        Unknown
      </template>
    </template>
    <template #status="{ value: status }">
      <span
        class="rounded-md px-1.5 py-0.5"
        :class="{
          'bg-blue text-base': getStatusValue(status) === Status.MIGRATED,
          'bg-yellow text-primary': getStatusValue(status) === Status.DRAFT,
          'bg-green text-base': getStatusValue(status) === Status.PUBLISHED,
        }"
      >{{ titleCased(getStatusLabel(status)) }}</span>
    </template>
  </PvEntityDetails>
</template>

<script lang="ts" setup>
import { type Specimen, Status } from '~/types/specimen'
defineProps<{
  specimen: Specimen
}>()

const getStatusValue = (status: Parameters<ReturnType<typeof useEnum<typeof Status>>[`valueOf`]>[0]) => useEnum(Status).valueOf(status)
const getStatusLabel = (status: Parameters<ReturnType<typeof useEnum<typeof Status>>[`labelOf`]>[0]) => useEnum(Status).labelOf(status)

</script>
