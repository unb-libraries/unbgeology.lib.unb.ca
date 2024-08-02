<template>
  <TwInputText v-model="newObjectID" name="objectID" placeholder="Comma separated pairs of &quot;type:ID&quot;, e.g. UNB:2024-13" class="input input-text-lg">
    <template #before>
      <div v-for="{ id, type} in value" :key="type" class="bg-accent-mid inline-flex space-x-1 text-nowrap rounded-md px-1.5 text-sm leading-6">
        <template v-if="type">
          {{ `${type}:${id}` }}
        </template>
        <template v-else>
          {{ id }}
        </template>
        <button class="px-1" @click.prevent.stop="onRemoveObjectId({ id, type })">
          <IconCancel class="h4 fill-accent-dark hover:stroke-base hover:fill-red stroke-accent-light w-4 stroke-2" />
        </button>
      </div>
    </template>
  </TwInputText>
</template>

<script setup lang="ts">
import { type ObjectID } from 'types/specimen'
const value = defineModel<ObjectID[]>({ required: false, default: [] })
const newObjectID = ref<string>(``)

watch(newObjectID, (currentValue) => {
  if (currentValue.at(-1) === `,`) {
    const actualValue = currentValue.slice(0, -1)
    const index = actualValue.indexOf(`:`)
    const [newID, newType] = (index >= 0 ? [actualValue.slice(index + 1), actualValue.slice(0, index)] : [actualValue, undefined]) as [string, string | undefined]
    value.value = [...value.value, { id: newID, type: newType }]
    newObjectID.value = ``
  }
})

function onRemoveObjectId(oid: ObjectID) {
  if (!value.value) { return }
  const index = value.value.findIndex(({ id, type }) => id === oid.id && type === oid.type)
  if (index >= 0) {
    value.value = value.value.filter((_, i) => i !== index)
  }
}
</script>
