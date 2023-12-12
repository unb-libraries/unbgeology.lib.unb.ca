<template>
  <PvConfirm :question="`Are your sure you want to delete &quot;${entityLabel}&quot;?`" />
</template>

<script setup lang="ts" generic="E extends Entity = Entity">
import { type Entity, type EntityJSON } from 'layers/base/types/entity'

const props = defineProps<{
  entity: EntityJSON<E>
  label:(keyof E) | ((entity: EntityJSON<E>) => string)
}>()

const entityLabel = computed(() => typeof props.label === `function`
  ? props.label(props.entity)
  : props.label in props.entity ? props.entity[props.label] : props.entity.self,
)
</script>
