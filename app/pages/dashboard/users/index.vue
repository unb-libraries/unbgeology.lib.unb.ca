<template>
  <PvEntityTable :entities="users" :columns="[`username`, [`created`, `Member since`], `updated`]">
    <template #updated="{ value, entity }">
      {{ entity.created !== value ? value : `never` }}
    </template>
  </PvEntityTable>
</template>

<script setup lang="ts">
import { type User } from '@unb-libraries/nuxt-layer-entity'

definePageMeta({
  layout: `dashboard`,
  name: `Users`,
})

const { entities: users } = await fetchEntityList<User>(`User`)
</script>
