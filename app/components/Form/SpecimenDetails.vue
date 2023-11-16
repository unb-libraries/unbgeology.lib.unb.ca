<template>
  <PvDetailsPage v-if="specimen">
    <template #nav>
      <!-- Workaround for removing navigation. -->
      <div />
    </template>
    <PvEntityDetails :entity="specimen!" :fields="[`editor`, `created`, [`updated`, `Last updated`], `status`]" item-class="my-2 first:mt-0 last:mb-0" label-class="text-md text-primary-60">
      <template #editor="{ value }">
        {{ value.username }}
      </template>
    </PvEntityDetails>
    <template #actions>
      <button class="border-red text-red hover:bg-red w-full rounded-md border p-1 hover:text-white">
        Delete
      </button>
    </template>
  </PvDetailsPage>
</template>

<script setup lang="ts">
import { type EntityJSON } from 'layers/base/types/entity'
const specimen = inject(`context`)
</script>
