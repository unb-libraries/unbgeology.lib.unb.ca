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
  </div>
</template>

<script setup lang="ts">
import { type RockClassification as Classification } from "types/classification"
import { FilterOperator, type EntityJSONBody } from "@unb-libraries/nuxt-layer-entity"
import { TaxonomyTermForm } from '#components'

definePageMeta({
  layout: `dashboard`,
})

const { content, close: closeModal } = useModal()

const { list: classificationList, entities: classifications, add: addClassification, update: updateClassification, remove: removeClassification } = await fetchEntityList<Classification>(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `classification/rock`]] })
async function onCreateClassification(classification: EntityJSONBody<Classification>) {
  await addClassification(classification)
  closeModal()
}

</script>
