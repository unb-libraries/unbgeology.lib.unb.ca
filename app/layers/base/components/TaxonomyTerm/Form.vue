<template>
  <EntityForm :entity="term">
    <template #default="{ body }">
      <slot name="label" :body="body">
        <div class="flex flex-col">
          <label class="mb-2 text-lg font-bold" for="label">Label</label>
          <PvInputText id="form-input-label" v-model="body.label" name="Label" />
        </div>
      </slot>
      <slot name="parent" :body="body">
        <div class="my-6 flex flex-col">
          <label class="mb-2 text-lg font-bold" for="parent">Parent</label>
          <EntityInputSelect id="form-select-parent" v-model="body.parent" name="parent" :options="terms" option-label="label" />
        </div>
      </slot>
      <slot :body="body" />
    </template>
  </EntityForm>
</template>

<script setup lang="ts" generic="T extends Taxonomy = Taxonomy">
import { type EntityJSON, type EntityJSONProperties, type Taxonomy } from 'layers/base/types/entity'

const props = defineProps<{
  term: EntityJSONProperties<Taxonomy> & Partial<EntityJSON<Taxonomy>>
  type: string
}>()

const { fetchAll } = useEntityType<T>(Symbol(`taxonomies`), props.type)
const { list: termEntities } = await fetchAll()

const terms = computed(() => termEntities.value?.entities ?? [])
</script>
