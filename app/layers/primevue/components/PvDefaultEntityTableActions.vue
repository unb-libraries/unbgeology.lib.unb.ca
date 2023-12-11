<template>
  <div class="flex flex-row justify-end space-x-2">
    <button class="bg-yellow rounded-md px-2 py-1 hover:cursor-pointer" @click.prevent="content = modalContent">
      Edit
    </button>
    <button class="bg-red rounded-md px-2 py-1 hover:cursor-pointer">
      Remove
    </button>
  </div>
</template>

<script setup lang="ts" generic="E extends Entity = Entity">
import { type EntityJSON, type Entity, type EntityJSONBody, type EntityJSONReference } from 'layers/base/types/entity'
import { type DynamicContent } from "layers/primevue/types"

const props = defineProps<{
  entity: EntityJSON<E>
  form: DynamicContent[`component`]
  formProps: DynamicContent[`props`]
  formEventHandlers: DynamicContent[`eventHandlers`]
  update: typeof updateEntity<E> | ReturnType<typeof useEntityType<E>>[`update`]
  remove: typeof deleteEntity | ReturnType<typeof useEntityType<E>>[`remove`]
}>()

const modalContent = computed<DynamicContent>(() => ({
  component: props.form,
  props: {
    entity: props.entity,
    ...props.formProps,
  },
  eventHandlers: {
    save: async (entity: EntityJSONBody<E>) => {
      await props.update(entity)
      closeModal()
    },
    remove: async (entity: EntityJSONReference) => {
      await props.remove(entity)
      closeModal()
    },
    cancel: () => closeModal(),
    ...props.formEventHandlers,
  },
}))

const { content, close: closeModal } = useModal()
</script>