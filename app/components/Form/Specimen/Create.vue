<template>
  <EntityForm :entity="data">
    <TwFormField label="Category">
      <TwInputRadioGroup
        v-model="data.type"
        :options="[[`fossil`, `Fossil`], [`mineral`, `Mineral`], [`rock`, `Rock`]]"
        class="w-full flex-row space-x-3"
        item-class="w-1/3 border border-primary-60/40 hover:border-accent-light rounded-md bg-primary flex flex-row items-center text-primary-60 hover:text-base"
        selected-item-class="!text-base !border-accent-mid"
        input-class="ml-6"
        label-class="w-full pr-6 py-4 h-full"
      >
        <template #label="{ option, label }">
          <div class="flex w-full flex-row items-center justify-between space-x-4">
            <div>{{ label }}</div>
            <IconFossil v-if="option === `fossil`" class="h-12 w-12 stroke-current stroke-1" />
            <IconMineral v-if="option === `mineral`" class="h-12 w-12 stroke-current stroke-1" />
            <IconRock v-if="option === `rock`" class="h-12 w-12 stroke-current stroke-1" />
          </div>
        </template>
      </TwInputRadioGroup>
    </TwFormField>
    <TwFormField v-if="data.type" label="Classification">
      <template #label>
        <template v-if="data.type === `fossil`">
          Taxonomy
        </template>
        <template v-if="data.type === `mineral`">
          Mineral type or group
        </template>
        <template v-if="data.type === `rock`">
          Rock type or group
        </template>
      </template>
      <PvInputDropdown v-model="data.classification" :options="classifications[data.type]" option-field="self" label-field="label" class="input-select-lg" />
    </TwFormField>
    <TwFormField label="Images">
      <TwInputImage v-model="data.images" :options="{}" />
    </TwFormField>
    <PvCheckbox v-model="unbOwned" label="Owned by UNB" class="input-checkbox" />
    <TwFormField v-if="unbOwned" label="ObjectIDs">
      <TwInputText v-model="objectID" class="input input-text-lg" />
    </TwFormField>
    <div class="flex flex-row space-x-2">
      <TwFormField v-if="!unbOwned" label="Loan" class="w-1/2">
        <PvInputDropdown v-model="data.loan" :options="[]" class="input-select-lg" />
      </TwFormField>
      <TwFormField v-if="!unbOwned" label="Given ID" class="w-1/2">
        <TwInputText v-model="data.lenderID" class="input input-text-lg" />
      </TwFormField>
    </div>
  </EntityForm>
</template>

<script setup lang="ts">
import { FilterOperator, type Image } from '@unb-libraries/nuxt-layer-entity'
import { type ObjectID, type Loan } from '~/types/specimen'

definePageMeta({
  layout: `dashboard-page`,
  name: `Create specimen`,
})

const objectID = ref(``)
const unbOwned = ref(true)

const data = reactive({
  type: undefined,
  objectIDs: [] as ObjectID[],
  classification: undefined,
  loan: undefined,
  lenderID: ``,
  images: {} as Record<string, string>,
})

const { entities: fossilClassifications } = await fetchEntityList(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `classification/fossil`]] })
const { entities: mineralClassifications } = await fetchEntityList(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `classification/mineral`]] })
const { entities: rockClassifications } = await fetchEntityList(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `classification/rock`]] })
const classifications = computed(() => ({ fossil: fossilClassifications.value, mineral: mineralClassifications.value, rock: rockClassifications.value }))

function onSave(values: { type: string, loan?: Loan, images: Record<string, Image> }) {
  console.log(values)
}
</script>
