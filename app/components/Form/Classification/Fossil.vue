<template>
  <TermForm :entity="classification" :type="type" :parents="parents">
    <template #default="{ body }">
      <TwFormField label="Parent">
        <PvInputDropdown v-model="body.parent" :options="parents" option-field="self" label-field="label" class="input-select-lg" />
      </Twformfield>
      <TwFormField label="Rank">
        <PvInputDropdown v-model="body.rank" :options="ranks" class="input-select-lg" />
      </Twformfield>
    </template>
  </TermForm>
</template>

<script setup lang="ts">
import { FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import type { Fossil as Classification, FossilFormData } from "~/types/classification"
import { Rank } from "~/types/classification"

defineProps<{
  classification?: Classification
}>()

const type = `classification/fossil`
const { fetchAll } = useEntityType<Classification, FossilFormData>(`Term`)
const { entities: parents } = await fetchAll({ filter: [[`type`, FilterOperator.EQUALS, type]] })
const ranks = useEnum(Rank).toTuples().map<[string, string]>(([value, label]) => [`${value}`, `${label}`[0].toUpperCase() + `${label}`.slice(1).toLowerCase()])
</script>
