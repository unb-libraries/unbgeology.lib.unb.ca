<template>
  <EntityForm :entity="input" @save="onSave" @cancel="onCancel">
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

<script setup lang="ts" generic="T extends Partial<Omit<Term, keyof Entity | `slug` | `label`>> & Pick<Term, `label`>">
import type { Entity, Term } from "@unb-libraries/nuxt-layer-entity"

const props = defineProps<{
  entity?: T
  type: string
}>()

const emits = defineEmits<{
  save: [term: T]
  cancel: [],
}>()

const input = reactive<T>({
  label: props.entity?.label ?? ``,
  type: props.type,
} as T)

function onSave(values: T) {
  const term = {
    label: values.label,
    type: props.type,
  } as T
  emits(`save`, term)
}

function onCancel() {
  emits(`cancel`)
}
</script>
