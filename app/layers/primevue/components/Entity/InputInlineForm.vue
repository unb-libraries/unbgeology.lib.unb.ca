<template>
  <div class="dark:bg-primary flex flex-row">
    <ul class="dark:border-primary-60/75 border-primary-20 hover:border-accent-light flex grow flex-row space-x-2 rounded-l-md border p-2">
      <li v-for="entity in entities" :key="entity.self" class="bg-accent-mid hover:bg-accent-light w-fit cursor-pointer rounded px-2 py-1" @click="onClickEntity(entity)">
        {{ typeof label === `string` ? label in entity ? entity[label] : entity.self : label(entity) }}
      </li>
    </ul>
    <button class="bg-accent-mid hover:bg-accent-light flex-none rounded-r-md px-4 py-2" @click.prevent="onAdd">
      Add
    </button>
    <PvModal v-if="showForm">
      <slot name="form" :entity="selectedEntity">
        <component :is="form" v-if="form" :entity="selectedEntity" @save="onSave" @cancel="onCancel" />
        <EntityForm v-else :entity="selectedEntity" @save="onSave" @cancel="onCancel">
          <template #default="{ body }">
            <slot name="entity-form" :body="body" />
          </template>
        </EntityForm>
      </slot>
    </PvModal>
  </div>
</template>

<script setup lang="ts" generic="E extends Entity = Entity">
import { type EntityJSONBody, type Entity, EntityJSONProperties } from 'layers/base/types/entity'
import { type DefineComponent } from 'nuxt/dist/app/compat/capi'

const props = defineProps<{
  modelValue: EntityJSONProperties<E>[]
  label:((item: EntityJSONProperties<E>) => string) | string
  form?: DefineComponent | string
}>()

const emits = defineEmits<{
  // eslint-disable-next-line
  'update:modelValue': [items: EntityJSONProperties<E>[]],
}>()

const entities = computed({
  get() {
    return props.modelValue
  },
  set(value: EntityJSONProperties<E>[]) {
    emits(`update:modelValue`, value)
  },
})

const showForm = ref<false | string>(false)
const selectedEntity = ref()

function onClickEntity(entity: EntityJSONProperties<E>) {
  showForm.value = entity.self
  selectedEntity.value = entity
}

function onAdd() {
  const self = `n_${Math.floor(Math.random() * 100)}`
  selectedEntity.value = { self }
  showForm.value = self
}

function onSave(entity: EntityJSONBody<E>) {
  if (entity.self.startsWith(`n_`)) {
    entity.self = entity.self.substring(2)
    entities.value.push(entity)
  } else {
    const index = entities.value.findIndex(e => e.self === entity.self)
    if (index >= 0) {
      entities.value[index] = entity
    }
  }
  showForm.value = false
}

function onCancel() {
  showForm.value = false
  selectedEntity.value = undefined
}

</script>
