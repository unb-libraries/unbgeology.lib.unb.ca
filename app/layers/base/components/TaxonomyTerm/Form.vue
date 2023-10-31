<template>
  <EntityForm :entity="term" :cancel-url="cancelUrl" @created="create" @updated="update">
    <template #default="{ entity: term }">
      <slot name="label" :term="term">
        <div class="flex flex-col">
          <label class="mb-2 text-lg font-bold" for="label">Label</label>
          <PvInputText id="form-input-label" v-model="term.label" name="Label" />
        </div>
      </slot>
      <slot name="parent" :term="term">
        <div class="my-6 flex flex-col">
          <label class="mb-2 text-lg font-bold" for="parent">Parent</label>
          <PvInputSelect id="form-select-parent" v-model="term.parent" name="parent" :options="list?.entities" option-label="label" />
        </div>
      </slot>
      <slot :term="term" />
    </template>
  </EntityForm>
</template>

<script setup lang="ts">
import { type Taxonomy } from '~/layers/base/types/entity';

const props = defineProps<{
  term: Partial<Taxonomy>
  type: string
  cancelUrl?: string
}>()

const { create, update, fetchAll } = useEntityType<Taxonomy>(Symbol(`taxonomies`), props.type)
const { list } = await fetchAll()
</script>
