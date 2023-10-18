<template>
  <EntityForm :type="[`taxonomies`, type, useEntityType<Taxonomy>]" :pk="slug" :success-url="successUrl" :cancel-url="cancelUrl">
    <template #default="{ entity: term }">
      <slot name="label" :term="term">
        <div class="flex flex-col">
          <label class="mb-2 text-lg font-bold" for="label">Label</label>
          <PvInputText :id="`${term.self}:label`" v-model="term.label" name="Label" />
        </div>
      </slot>
      <slot name="parent" :term="term">
        <div class="my-6 flex flex-col">
          <label class="mb-2 text-lg font-bold" for="parent">Parent</label>
          <PvInputSelect :id="`${term.self}:parent`" v-model="term.parent" name="parent" :options="list?.items" option-label="label" />
        </div>
      </slot>
      <slot :term="term" />
    </template>
  </EntityForm>
</template>

<script setup lang="ts">
import { type Taxonomy } from '~/layers/base/types/entity';

const props = defineProps<{
  type: string
  slug?: string
  successUrl?: string
  cancelUrl?: string
}>()

const { list } = await fetchEntityList<Taxonomy>(Symbol(`taxonomies`), props.type)
</script>
