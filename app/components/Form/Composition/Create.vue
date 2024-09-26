<template>
  <EntityForm
    :entity="term"
    @save="onSave"
    @cancel="$emit(`cancel`)"
  >
    <TwInputRadioGroup
      v-model="term.type"
      :options="[[`fossil`, `Fossil`], [`rock`, `Rock`]]"
      class="w-full flex-row space-x-3"
      item-class="w-1/2 border border-primary-60/40 hover:border-accent-light rounded-md bg-primary flex flex-row items-center text-primary-60 hover:text-base"
      selected-item-class="!text-base !border-accent-mid"
      input-class="ml-6"
      label-class="w-full pr-6 py-4 h-full"
    >
      <template #label="{ option, label }">
        <div class="flex w-full flex-row items-center justify-between space-x-4">
          <div>{{ label }}</div>
          <IconFossil
            v-if="option === `fossil`"
            class="size-12 stroke-current stroke-1"
          />
          <IconRock
            v-if="option === `rock`"
            class="size-12 stroke-current stroke-1"
          />
        </div>
      </template>
    </TwInputRadioGroup>
    <TwFormField label="Label">
      <TwInputText
        v-model="term.label"
        class="input input-text-lg"
      />
    </twformfield>
  </EntityForm>
</template>

<script lang="ts" setup>
import type { Composition } from '~/types/composition'

type CompositionCreateBody = Pick<Composition, `type` | `label`>
const emits = defineEmits<{
  save: [term: CompositionCreateBody]
  cancel: []
}>()

const term = reactive({
  type: undefined,
  label: undefined,
})

function onSave({ type, label }: CompositionCreateBody) {
  console.log(`new term`, { type, label })
  emits(`save`, { type: `composition/${type}`, label })
}
</script>
