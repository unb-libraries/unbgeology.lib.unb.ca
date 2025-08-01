<template>
  <NuxtLayout name="page">
    <template #breadcrumbs></template>
    <div class="flex gap-x-6 w-full">
      <article v-for="category in ['fossil', 'mineral', 'rock']" class="flex flex-col gap-y-6 w-1/3">
        <SpecimenImage :category="(category as 'fossil' | 'mineral' | 'rock')" width="525" height="375" class="w-full text-base-57 aspect-7/5 bg-base-77 border border-base-57 rounded-md overflow-hidden" />
        <h2 class="text-2xl">{{ category.charAt(0).toUpperCase() + category.slice(1) }}s</h2>
        <div>
          <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quod, sequi. Placeat facere enim culpa, corrupti accusantium dicta quae debitis ab, saepe qui a nihil quod dolores ratione. Doloremque, reiciendis rem?</p>
          <a :href="`/browse/${category}`" class="text-accent-mid text-lg font-semibold hover:underline border-none rounded-md">Browse {{ category.charAt(0).toUpperCase() + category.slice(1) }}s</a>
        </div>
      </article>
    </div>
  </NuxtLayout>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: false,
  name: 'Browse',
})
</script>