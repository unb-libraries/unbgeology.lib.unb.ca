<template>
  <PvEntityTable :entities="people" :columns="[[`lastName`, `Last name`], [`firstName`, `First name`], `title`, `email`, `phone`]">
    <template #name="{ entity: person }">
      <NuxtLink :to="`/dashboard/affiliates/people/${person.id}`" class="hover:underline">
        {{ person.lastName }}, {{ person.firstName }}
      </NuxtLink>
    </template>
    <template #title="{ value: title }">
      <span v-if="title === String(Title.DR | Title.PROF)">Prof. Dr.</span>
      <span v-else-if="title === String(Title.DR)">Dr.</span>
      <span v-else-if="title === String(Title.PROF)">Prof.</span>
      <span v-else />
    </template>
  </PvEntityTable>
</template>

<script setup lang="ts">
import { Title } from '~/types/affiliation'

definePageMeta({
  layout: `dashboard`,
})

const { entities: people } = await fetchEntityList(`People`)
</script>
