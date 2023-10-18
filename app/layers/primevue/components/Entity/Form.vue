<template>
  <form @submit.prevent="submit()">
    <slot :entity="(entity as E)" />
    <div class="mt-8 flex flex-row">
      <button type="submit" class="bg-accent-dark dark:bg-accent-mid hover:bg-accent-light mr-2 rounded-md p-3 font-bold text-white">
        Save
      </button>
      <NuxtLink :to="cancelUrl ?? `/`" class="font-base ml-2 p-3" @click.prevent="emits(`cancelled`)">
        Cancel
      </NuxtLink>
    </div>
  </form>
</template>

<script setup lang="ts" generic="E extends Entity">
import { type Entity } from "~/layers/base/types/entity"

const props = defineProps<{
  type: [string, string, typeof useEntityType<E>]
  pk?: string
  successUrl?: string
  cancelUrl?: string
}>()

const emits = defineEmits<{
  created: [entity: E],
  updated: [entity: E],
  cancelled: [],
}>()

const [entityTypeId, bundle, entityType] = props.type
const { create, fetchByPK, update } = entityType(Symbol(entityTypeId), bundle)
const isNew = props.pk === undefined
const entity = !isNew
  ? await (async (pk: string) => {
      return (await fetchByPK(pk)).entity
    })(props.pk)
  : ref({} as E)

if (props.pk && !entity.value) {
  showError({ statusCode: 404 })
}

const submit = async function () {
  if (isNew) {
    const { entity: newEntity } = await create(entity.value as E)
    if (newEntity.value) {
      emits(`created`, newEntity.value as E)
      if (props.successUrl) {
        navigateTo(props.successUrl)
      }
    }
  } else {
    const { entity: updatedEntity } = await update(entity.value as E)
    if (updatedEntity.value) {
      emits(`updated`, updatedEntity.value as E)
      if (props.successUrl) {
        navigateTo(props.successUrl)
      }
    }
  }
}
</script>
