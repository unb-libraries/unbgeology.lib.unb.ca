<template>
  <TermForm :entity="classification" :type="type" :parents="parents">
    <template #default="{ body }">
      <TwFormField label="Parent">
        <PvInputDropdown v-model="body.parent" :options="parents" option-field="self" label-field="label" class="input-select-lg" />
      </Twformfield>
    </template>
  </TermForm>
</template>

<script setup lang="ts">
import { FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import type { Rock as Classification, RockFormData } from "~/types/classification"

defineProps<{
  classification?: Classification
}>()

const type = `classification/rock`
const { fetchAll } = useEntityType<Classification, RockFormData>(`Term`)
const { entities: parents } = await fetchAll({ filter: [[`type`, FilterOperator.EQUALS, type]] })
</script>
