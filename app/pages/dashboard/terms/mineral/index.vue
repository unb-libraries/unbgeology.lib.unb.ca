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

    <section>
      <header class="flex flex-row justify-between">
        <h2 class="mb-6 text-2xl">
          Portion
        </h2>
        <div class="space-x-1">
          <button class="form-action form-action-submit p-2 font-normal" @click.prevent="content = { component: TermForm, props: { entity: {}, parents: classifications }, eventHandlers: { save: onCreatePortion, cancel: () => closeModal()}}">
            Create
          </button>
        </div>
      </header>
      <PvEntityTable :entities="portions" :columns="[`label`, [`actions`, ``]]">
        <template #actions="{ entity: term }">
          <PvDefaultEntityTableActions
            :entity="term"
            label="label"
            :form="TermForm"
            :form-props="{ parents: portions }"
            :update="updatePortion"
            :remove="removePortion"
            class="invisible group-hover:visible group-focus:visible"
          />
        </template>
        <template #footer>
          <span v-if="portionList?.total" class="italic">{{ pluralize(portionList?.total, `term`, `terms`) }}</span>
        </template>
      </PvEntityTable>
    </section>
  </div>
</template>

<script setup lang="ts">
import { type EntityJSONBody } from "@unb-libraries/nuxt-layer-entity"
import { type Classification, type Portion } from "types/vocabularies/mineral"
import { TermForm, TaxonomyTermForm, FormMineralClassification } from "#components"

definePageMeta({
  layout: `dashboard`,
})

const { content, close: closeModal } = useModal()

const { list: classificationList, entities: classifications, add: addClassification, update: updateClassification, remove: removeClassification } = await fetchEntityList<Classification>(`Mineral.Classification`)
async function onCreateMineral(mineral: EntityJSONBody<Classification>) {
  await addClassification(mineral)
  closeModal()
}

const { list: portionList, entities: portions, add: addPortion, update: updatePortion, remove: removePortion } = await fetchEntityList<Portion>(`Mineral.Portion`)
async function onCreatePortion(portion: EntityJSONBody<Portion>) {
  await addPortion(portion)
  closeModal()
}
</script>
