<template>
  <EntityForm :entity="input" @save="e => onSave(e as unknown as T)" @cancel="onCancel">
    <template #default="{ body }">
      <TwFormField label="Label">
        <slot name="label" :body="body">
          <TwInputText v-model="body.label" class="input input-text-lg" />
        </slot>
      </TwFormField>
      <slot :body="body" />
    </template>
  </EntityForm>
</template>

<script setup lang="ts" generic="T extends Term, F extends Omit<Partial<T>, keyof Entity | `slug` | `type`>">
import type { Entity, Term } from "@unb-libraries/nuxt-layer-entity"

const props = defineProps<{
  entity?: F
  type: string
}>()

const emits = defineEmits<{
  save: [term: T]
  cancel: [],
}>()

const input = reactive<F>(props.entity ?? { label: `` } as F)

function onSave(values: T) {
  const term = {
    ...values,
    type: props.type,
  } as T
  emits(`save`, term)
}

function onCancel() {
  emits(`cancel`)
}
</script>
