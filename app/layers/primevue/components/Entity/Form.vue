<template>
  <form class="form-col" @submit.prevent="submit()">
    <slot :body="entityBody" />
    <div class="form-actions">
      <slot name="actions" :body="entityBody">
        <button type="submit" class="form-action form-action-submit">
          Save
        </button>
        <slot name="more-actions" :body="entityBody" />
      </slot>
      <span class="form-action form-action-cancel" @click.prevent="emits(`cancel`)">
        Cancel
      </span>
    </div>
  </form>
</template>

<script setup lang="ts" generic="E extends Entity = Entity, P extends keyof Omit<E, keyof Entity> = keyof Omit<E, keyof Entity>">
import { type Entity, type EntityJSON, type EntityJSONBody, type EntityJSONProperties } from "@unb-libraries/nuxt-layer-entity"

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
