<template>
  <PvEntityTable :entity-type-id="entityTypeId!" :columns="[`label`]" />
</template>

<script setup lang="ts">
definePageMeta({
  layout: `dashboard`,
})

const { type } = useRoute().params
const entityTypeId = Object.keys(useAppConfig().entityTypes).find(key => key.toLowerCase() === type)
if (!entityTypeId) {
  showError({ statusCode: 404 })
}

</script>
