<template>
  <form @submit.prevent="submit()">
    <slot :body="entityBody" />
    <div class="mt-8 flex flex-row space-x-2">
      <slot name="actions" :body="entityBody">
        <button type="submit" class="bg-accent-dark dark:bg-accent-mid hover:bg-accent-light rounded-md p-3 font-bold text-white">
          Save
        </button>
        <slot name="more-actions" :body="entityBody" />
      </slot>
      <span class="font-base p-3 hover:cursor-pointer hover:underline" @click.prevent="emits(`cancel`)">
        Cancel
      </span>
    </div>
  </form>
</template>

<script setup lang="ts" generic="E extends Entity = Entity, P extends keyof Omit<E, keyof Entity> = keyof Omit<E, keyof Entity>">
import { type Entity, type EntityJSON, type EntityJSONBody, type EntityJSONProperties } from "layers/base/types/entity"

const props = defineProps<{
  entity: EntityJSONProperties<E, P> & Partial<EntityJSON<Entity>>
}>()

const emits = defineEmits<{
  save: [entity: EntityJSONBody<E, P>],
  cancel: [],
}>()

const entityBody = ref(getEntityPayload<E, P>(props.entity))

const submit = function () {
  emits(`save`, entityBody.value as EntityJSONBody<E, P>)
}
</script>
