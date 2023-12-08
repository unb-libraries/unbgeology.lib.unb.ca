<template>
  <div class="space-y-24">
    <section>
      <h2 class="mb-6 text-2xl">
        Geochronology
      </h2>
      <PvEntityTable entity-type-id="Geochronology" :columns="[`label`, `division`]">
        <template #division="{ value: division }">
          {{ division.substring(0, 1).toUpperCase() + division.substring(1).toLowerCase() }}
        </template>
      </PvEntityTable>
    </section>

    <section>
      <h2 class="mb-6 text-2xl">
        Classifications
      </h2>
      <PvEntityTable entity-type-id="Classification" :columns="[`label`]" />
    </section>

    <section>
      <h2 class="mb-6 text-2xl">
        Storage locations
      </h2>
      <PvEntityTable entity-type-id="StorageLocation" :columns="[`label`]" />
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: `dashboard`,
})
</script>
