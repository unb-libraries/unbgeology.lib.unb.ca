<template>
  <PvEntityDetails :entity="specimen!" :fields="[[`id`, `ID`], `name`, [`type`, `Category`], `classification`, `created`, `updated`, `status`]" class="space-y-4" label-class="font-bold italic">
    <template #id="{ value: id }">
      {{ id }}
    </template>
    <template #type="{ value: category }">
      {{ titleCased(category) }}
    </template>
    <template #classification="{ value: classification }">
      <template v-if="classification">
        {{ classification.label }}
      </template>
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
