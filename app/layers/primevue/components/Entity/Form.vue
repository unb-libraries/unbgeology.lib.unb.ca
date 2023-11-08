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

<script setup lang="ts" generic="E extends Entity = Entity, P extends keyof Omit<E, keyof Entity> = keyof Omit<E, keyof Entity>">
import { type Entity, type EntityJSON, type EntityJSONBody, type EntityJSONProperties } from "layers/base/types/entity"

const props = defineProps<{
  entity: EntityJSONProperties<E, P> & Partial<EntityJSON<Entity>>
  cancelUrl?: string
}>()

const emits = defineEmits<{
  save: [entity: EntityJSONBody<E, P>],
  cancelled: [],
}>()

const entityBody = ref(getEntityPayload<E, P>(props.entity))

const submit = function () {
  emits(`save`, entityBody.value as EntityJSONBody<E, P>)
}
</script>
