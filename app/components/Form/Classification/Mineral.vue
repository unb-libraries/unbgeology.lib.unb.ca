<template>
  <TermForm :entity="classification" :type="type" :parents="parents">
    <template #default="{ body }">
      <TwFormField label="Parent">
        <PvInputDropdown v-model="body.parent" :options="parents" option-field="self" label-field="label" class="input-select-lg" />
      </Twformfield>
      <TwFormField label="Composition">
        <TwInputText v-model="body.composition" class="input-text-lg" />
      </Twformfield>
    </template>
  </TermForm>
</template>

<script setup lang="ts">
import { FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import type { Mineral as Classification, MineralFormData } from "~/types/classification"

defineProps<{
  classification?: Classification
}>()

const type = `classification/mineral`
const { fetchAll } = useEntityType<Classification, MineralFormData>(`Term`)
const { entities: parents } = await fetchAll({ filter: [[`type`, FilterOperator.EQUALS, type]] })
</script>
