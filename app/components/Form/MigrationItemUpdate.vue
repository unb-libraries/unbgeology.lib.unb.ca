<template>
  <EntityForm
    @save="onSave"
    @cancel="$emit(`cancel`)"
  >
    <TwFormField label="Fields">
      <PvMultipleChoice
        v-model="fields"
        :options="options"
      />
    </TwFormField>
  </EntityForm>
</template>

<script lang="ts" setup>
import type { MigrationItem } from '@unb-libraries/nuxt-layer-entity'

const props = defineProps<{
  item: Pick<MigrationItem, `data`>
  sourceIDField?: string
}>()

const emits = defineEmits<{
  save: [fields: string[]]
  cancel: []
}>()

const fields = ref<Record<string, boolean>>(Object.fromEntries(Object.keys(props.item.data).map(field => [field, false])))
const options = computed(() => Object.keys(props.item.data)
  .filter(k => k !== `self`)
  .filter((k, index) => props.sourceIDField ? k !== props.sourceIDField : index > 0)
  .sort((k1, k2) => k1 < k2 ? -1 : k1 > k2 ? 1 : 0))

function onSave() {
  emits(`save`, Object.entries(fields.value).filter(([, checked]) => checked).map(([field]) => field))
}
</script>
