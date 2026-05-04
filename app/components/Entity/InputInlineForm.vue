<template>
  <div class="inline-flex">
    <ul class="flex grow flex-row space-x-2 p-2" :class="inputClass">
      <li v-for="entity in entities" :key="entity.self" class="bg-accent-mid hover:bg-accent-light w-fit cursor-pointer rounded px-2 py-1" @click="onClickEntity(entity)">
        {{ typeof label === `string` ? label in entity ? entity[label] : entity.self : label(entity) }}
      </li>
    </ul>
    <button class="bg-accent-mid hover:bg-accent-light flex-none rounded-r-md px-4 py-2" @click.prevent="onAdd">
      Add
    </button>
  </div>
</template>

<script setup lang="ts" generic="E extends Entity = Entity">
import { type EntityJSONBody, type Entity, type EntityJSONProperties } from "@unb-libraries/nuxt-layer-entity"
import { type DynamicContent } from '../../types'

const props = defineProps<{
  modelValue: EntityJSONProperties<E>[]
  inputClass?: string
  label:((item: EntityJSONProperties<E>) => string) | string
  form: DynamicContent[`component`]
  formProps?: DynamicContent[`props`]
  formEventHandlers?: DynamicContent[`eventHandlers`]
}>()

const emits = defineEmits<{
  // eslint-disable-next-line
  'update:modelValue': [items: EntityJSONProperties<E>[]],
}>()

const entities = computed({
  get() {
    return props.modelValue ?? []
  },
  set(value: EntityJSONProperties<E>[]) {
    emits(`update:modelValue`, value)
  },
})

const { content, close: closeModal } = useModal()

const modal = computed<DynamicContent>(() => ({
  component: props.form,
  props: {
    entity: selectedEntity,
    ...props.formProps,
  },
  eventHandlers: {
    save: onSave,
    delete: () => remove(selectedEntity.value),
    cancel: onCancel,
    ...props.formEventHandlers,
  },
}))

const selectedEntity = ref()

function onClickEntity(entity: EntityJSONProperties<E>) {
  content.value = modal.value
  selectedEntity.value = entity
}

function add(entity: EntityJSONBody<E>) {
  entity.self = entity.self.substring(2)
  entities.value = [...entities.value, entity]
}

function update(entity: EntityJSONBody<E>) {
  const index = entities.value.findIndex(e => e.self === entity.self)
  if (index >= 0) {
    entities.value[index] = entity
  }
}

function remove(entity: EntityJSONBody<E>) {
  const index = entities.value.findIndex(e => e.self === entity.self)
  if (index >= 0) {
    entities.value.splice(index, 1)
  }
  closeModal()
}

function onAdd() {
  const self = `n_${Math.floor(Math.random() * 100)}`
  selectedEntity.value = { self }
  content.value = modal.value
}

function onSave(entity: EntityJSONBody<E>) {
  if (entity.self.startsWith(`n_`)) {
    add(entity)
  } else {
    update(entity)
  }
  closeModal()
}

function onCancel() {
  selectedEntity.value = undefined
  closeModal()
}

</script>
