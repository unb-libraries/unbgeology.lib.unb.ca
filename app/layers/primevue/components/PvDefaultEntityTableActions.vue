<template>
  <div class="flex flex-row justify-end space-x-2">
    <button class="bg-yellow hover:bg-yellow-light rounded-md px-2 py-1 hover:cursor-pointer" @click.prevent="content = modalUpdate">
      Edit
    </button>
    <button class="bg-red hover:bg-red-light rounded-md px-2 py-1 hover:cursor-pointer" @click.prevent="content = modalConfirmDelete">
      Remove
    </button>
  </div>
</template>

<script setup lang="ts" generic="E extends Entity = Entity">
import { type EntityJSON, type Entity, type EntityJSONBody, type EntityJSONReference } from 'layers/base/types/entity'
import { type DynamicContent } from "layers/primevue/types"
import { PvEntityDeleteConfirm } from '#components'

const props = defineProps<{
  entity: EntityJSON<E>
  label:(keyof E) | ((entity: EntityJSON<E>) => string)
  form: DynamicContent[`component`]
  formProps?: DynamicContent[`props`]
  formEventHandlers?: DynamicContent[`eventHandlers`]
  update: typeof updateEntity<E> | ReturnType<typeof useEntityType<E>>[`update`] | ReturnType<typeof fetchEntityList<E>>[`update`]
  remove: typeof deleteEntity | ReturnType<typeof useEntityType<E>>[`remove`] | ReturnType<typeof fetchEntityList<E>>[`remove`]
}>()

const modalUpdate = computed<DynamicContent>(() => ({
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

const modalConfirmDelete = computed<DynamicContent>(() => ({
  component: PvEntityDeleteConfirm,
  props: {
    entity: props.entity,
    label: props.label,
  },
  eventHandlers: {
    confirm: async () => {
      await props.remove(props.entity)
      closeModal()
    },
    cancel: () => closeModal(),
    ...props.formEventHandlers,
  },
}))

const { content, close: closeModal } = useModal()
</script>
