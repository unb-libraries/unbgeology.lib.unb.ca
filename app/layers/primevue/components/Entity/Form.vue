<template>
  <form @submit.prevent="submit()">
    <slot :body="entityBody" />
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

<script setup lang="ts" generic="E extends Entity">
import { type Entity, type EntityJSON, type EntityJSONCreateBody, type EntityJSONUpdateBody } from "~/layers/base/types/entity"

const props = defineProps<{
  entity: EntityJSON<E>
  cancelUrl?: string
}>()

const emits = defineEmits<{
  created: [entity: EntityJSONCreateBody<E>],
  updated: [entity: EntityJSONUpdateBody<E>],
  cancelled: [],
}>()

const entityBody = ref(getEntityPayload<E>(props.entity))

const submit = function () {
  if (!(`self` in props.entity)) {
    emits(`created`, entityBody.value as EntityJSONCreateBody<E>)
  } else {
    emits(`updated`, entityBody.value as EntityJSONUpdateBody<E>)
  }
}
</script>
