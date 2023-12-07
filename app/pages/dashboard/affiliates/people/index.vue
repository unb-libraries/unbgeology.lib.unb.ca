<template>
  <PvEntityTable entity-type-id="People" :columns="[[`public`, ``], `name`, `email`, `phone`, `affiliations`]">
    <template #public="{ entity: person }">
      <svg
        v-if="!person.public"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="h-6 w-6"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
      <div v-else />
    </template>
    <template #name="{ entity: person }">
      <NuxtLink :to="`/dashboard/affiliates/people/${person.id}`" class="hover:underline">
        {{ person.lastName }}, {{ person.firstName }}
      </NuxtLink>
    </template>
    <template #affiliations="{ value: affiliations }">
      <div v-if="affiliations.length > 0">
        <span v-for="org in affiliations" :key="org.self">{{ org.id }}</span>
      </div>
      <div v-else />
    </template>
  </PvEntityTable>
</template>

<script setup lang="ts">
definePageMeta({
  layout: `dashboard`,
})
</script>
