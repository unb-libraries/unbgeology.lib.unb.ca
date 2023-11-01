<template>
  <form @submit.prevent="submit()">
    <slot :entity="entity" />
    <div class="mt-8 flex flex-row">
      <button type="submit" class="bg-accent-dark dark:bg-accent-mid hover:bg-accent-light mr-2 rounded-md p-3 font-bold text-white">
        Save
      </button>
      <NuxtLink v-if="cancelUrl" :to="cancelUrl" class="font-base ml-2 p-3" @click.prevent="emits(`cancelled`)">
        Cancel
      </NuxtLink>
    </div>
  </form>
</template>

<script setup lang="ts" generic="E extends Entity | EntityJSON">
import { EntityJSON, type Entity } from "~/layers/base/types/entity"

const props = defineProps<{
  entity: Partial<E>
  cancelUrl?: string
}>()

const emits = defineEmits<{
  created: [entity: E],
  updated: [entity: EntityJSON<E>],
  cancelled: [],
}>()

const submit = async function () {
  if (!(`self` in props.entity)) {
    emits(`created`, props.entity as E)
  } else {
    emits(`updated`, props.entity as EntityJSON<E>)
  }
}
</script>
