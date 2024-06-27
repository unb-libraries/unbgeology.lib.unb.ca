<template>
  <EntityForm :entity="entity" @save="onSave" @cancel="$emit(`cancel`)">
    <TwFormField label="Name">
      <PvInputText id="form-input-label" v-model="name" class="input input-text-lg" />
    </TwFormField>
    <TwFormField v-if="entityTypeOptions?.length" label="Entity type">
      <PvInputDropdown
        v-model="entityType"
        class="input-select-lg"
        :options="entityTypeOptions ?? []"
      />
    </TwFormField>
    <TwFormField label="Dependencies">
      <PvInputDropdown
        v-model="dependencies"
        class="input-select-lg"
        :multi="true"
        :options="migrations"
        option-field="self"
        label-field="name"
      />
    </TwFormField>
  </EntityForm>
</template>

<script setup lang="tsx">
import { type MigrationItem, type Migration } from "@unb-libraries/nuxt-layer-entity"

const props = defineProps<{
  entity?: Migration
  entityTypeOptions?: [string, string][]
}>()

const emits = defineEmits<{
  save: [migration: Pick<Migration, `name` | `entityType` | `dependencies`>, items?: Pick<MigrationItem, `id` | `data`>[]]
  cancel: []
}>()

const { entities: migrations } = await fetchEntityList(`Migration`)
const name = ref(props.entity?.name)
const entityType = ref(props.entity?.entityType)
const dependencies = ref<string[]>(props.entity?.dependencies?.entities.map(d => d.self) ?? [])
const items = ref<Pick<MigrationItem, `sourceID` | `data`>[]>([])

function onSave() {
  emits(`save`, {
    name: name.value,
    entityType: entityType.value,
    dependencies: dependencies.value,
  }, items.value)
}
</script>
