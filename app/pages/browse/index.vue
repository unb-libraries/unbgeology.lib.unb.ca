<template>
  <NuxtLayout name="page">
    <template #breadcrumbs></template>
    <div class="grid grid-cols-3 gap-x-12">
      <CategoryCard v-for="category in ['fossil', 'mineral', 'rock']"
        :key="category"
        :category="(category as 'fossil' | 'mineral' | 'rock')"
      />
    </div>
  </NuxtLayout>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: false,
  name: 'Browse',
})
</script>