<template>
  <div class="space-y-24">
    <section>
      <header class="flex flex-row justify-between">
        <h2 class="mb-6 text-2xl">
          Classification
        </h2>
        <div class="space-x-1">
          <button class="form-action form-action-submit p-2 font-normal" @click.prevent="content = { component: TaxonomyTermForm, props: { entity: {}, parents: classifications }, eventHandlers: { save: onCreateClassification, cancel: () => closeModal()}}">
            Create
          </button>
        </div>
      </header>
      <PvEntityTable :entities="classifications" :columns="[`label`, [`actions`, ``]]">
        <template #actions="{ entity: term }">
          <PvDefaultEntityTableActions
            :entity="term"
            label="label"
            :form="TaxonomyTermForm"
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
import { type Classification, type Portion } from 'types/vocabularies/rock'
import { type EntityJSONBody } from "@unb-libraries/nuxt-layer-entity"
import { TermForm, TaxonomyTermForm } from '#components'

definePageMeta({
  layout: `dashboard`,
})

const { content, close: closeModal } = useModal()

const { list: classificationList, entities: classifications, add: addClassification, update: updateClassification, remove: removeClassification } = await fetchEntityList<Classification>(`Rock.Classification`)
async function onCreateClassification(classification: EntityJSONBody<Classification>) {
  await addClassification(classification)
  closeModal()
}

const { list: portionList, entities: portions, add: addPortion, update: updatePortion, remove: removePortion } = await fetchEntityList<Portion>(`Rock.Portion`)
async function onCreatePortion(portion: EntityJSONBody<Portion>) {
  await addPortion(portion)
  closeModal()
}

</script>
