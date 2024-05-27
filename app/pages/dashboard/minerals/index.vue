<template>
  <div class="space-y-24">
    <section>
      <header class="flex flex-row justify-between">
        <h2 class="mb-6 text-2xl">
          Classification
        </h2>
        <div class="space-x-1">
          <button class="form-action form-action-submit p-2 font-normal" @click.prevent="content = { component: TaxonomyTermForm, props: { entity: {}, parents: classifications }, eventHandlers: { save: onCreateMineral, cancel: () => closeModal()}}">
            Create
          </button>
        </div>
      </header>
      <PvEntityTable :entities="classifications" :columns="[`label`, [`actions`, ``]]">
        <template #label="{ value: label, entity }">
          <NuxtLink :to="`/dashboard/terms/mineral/${entity.slug}`" class="hover:underline">
            {{ label }}
          </NuxtLink>
        </template>
        <template #actions="{ entity: term }">
          <PvDefaultEntityTableActions
            :entity="term"
            label="label"
            :form="FormMineralClassification"
            :form-props="{ parents: classifications }"
            :update="updateClassification"
            :remove="removeClassification"
            class="invisible group-hover:visible group-focus:visible"
          />
        </template>
        <template #footer>
          <span v-if="classificationList?.total" class="italic">{{ pluralize(classificationList?.total, `term`, `terms`) }}</span>
        </template>
      </PvEntityTable>
    </section>
  </div>
</template>

<script setup lang="ts">
import { FilterOperator, type EntityJSONBody } from "@unb-libraries/nuxt-layer-entity"
import { type MineralClassification as Classification } from "types/classification"
import { TaxonomyTermForm, FormMineralClassification } from "#components"

definePageMeta({
  layout: `dashboard`,
  name: `Minerals`,
  menu: {
    weight: 40,
  },
})

const { content, close: closeModal } = useModal()

const { list: classificationList, entities: classifications, add: addClassification, update: updateClassification, remove: removeClassification } = await fetchEntityList<Classification>(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `classification/mineral`]] })
async function onCreateMineral(mineral: EntityJSONBody<Classification>) {
  await addClassification(mineral)
  closeModal()
}
</script>
