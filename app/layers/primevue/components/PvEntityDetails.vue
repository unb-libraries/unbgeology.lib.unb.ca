<template>
  <dl>
    <div v-for="[field, label] in fields" :key="field" :class="itemClass">
      <dt :class="labelClass">
        {{ label }}
      </dt>
      <dd :class="valueClass">
        <slot :name="field" :value="(entity as E)[field]" :entity="entity">
          {{ (entity as E)[field] }}
        </slot>
      </dd>
    </div>
  </dl>
</template>

<script setup lang="ts" generic="E extends Entity = Entity">
import { type Entity } from "@unb-libraries/nuxt-layer-entity"

const props = defineProps<{
  entity: E
  fields:(keyof E | [keyof E, string])[]
  itemClass?: string
  labelClass?: string
  valueClass?: string
}>()

const fields = computed(() => (props.fields).map<[keyof E, string]>(field =>
  !Array.isArray(field)
    ? [field, String(field).substring(0, 1).toUpperCase() + String(field).substring(1)]
    : field,
))
</script>
