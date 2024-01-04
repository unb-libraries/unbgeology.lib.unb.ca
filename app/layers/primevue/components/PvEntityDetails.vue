<template>
  <dl>
    <div v-for="[field, label] in fields" :key="field" :class="itemClass">
      <dt :class="labelClass">
        {{ label }}
      </dt>
      <dd :class="valueClass">
        <slot :name="field" :value="entity[field]">
          {{ entity[field] }}
        </slot>
      </dd>
    </div>
  </dl>
</template>

<script setup lang="ts" generic="E extends Entity = Entity">
import { type Entity, type EntityJSON } from "@unb-libraries/nuxt-layer-entity"

const props = defineProps<{
  entity: EntityJSON<E>
  fields?:(string | [string, string])[]
  itemClass?: string
  labelClass?: string
  valueClass?: string
}>()

const fields = computed(() => (props.fields ?? Object.keys(props.entity)).map(field =>
  typeof field === `string`
    ? [field, field.substring(0, 1).toUpperCase() + field.substring(1)]
    : field,
))
</script>
