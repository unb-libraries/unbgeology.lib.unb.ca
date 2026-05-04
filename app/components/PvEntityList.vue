<template>
  <ul>
    <slot name="before" />
    <li v-for="entity in entities" :key="entity.self" :class="itemClass">
      <slot :entity="entity">
        <span v-if="label && typeof label === 'string' && label in entity">{{ entity[label as keyof E] }}</span>
        <span v-else-if="label && typeof label === 'function'">{{ label(entity) }}</span>
      </slot>
    </li>
    <slot name="after" />
  </ul>
</template>

<script setup lang="ts" generic="E extends Entity = Entity">
import { type EntityJSON, type Entity } from "@unb-libraries/nuxt-layer-entity"

defineProps<{
  entities: EntityJSON<E>[]
  itemClass?: string
  label?:((entity: EntityJSON<E>) => string) | keyof E
}>()
</script>
