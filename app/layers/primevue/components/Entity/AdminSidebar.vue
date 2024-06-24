<template>
  <div class="flex h-full flex-col space-y-4 overflow-hidden">
    <div class="h-full overflow-y-scroll">
      <slot>
        <span v-if="entities.length">{{ pluralize(entities.length, `user`, `users`) }} selected</span>
      </slot>
    </div>
    <div class="grow-0 empty:hidden">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts" generic="E extends Entity">
import type { Entity, EntityJSON } from "@unb-libraries/nuxt-layer-entity"

defineProps<{
  entities: EntityJSON<E>[]
}>()
</script>
