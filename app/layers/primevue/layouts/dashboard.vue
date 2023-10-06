<template>
  <NuxtLayout name="default">
    <header class="container mx-auto">
      <h1 class="my-8 text-4xl">
        Dashboard
      </h1>
    </header>
    <div id="content" class="container mx-auto mb-16 mt-4">
      <div class="flex flex-row">
        <nav class="flex list-none flex-col text-right">
          <NuxtLink v-for="taxonomy in taxonomies" :key="taxonomy.self" :to="`/dashboard/${taxonomy.self.substring(5)}`" class="hover:bg-accent-light p-3 pl-12" active-class="bg-accent-mid">
            {{ taxonomy.name }}
          </NuxtLink>
        </nav>
        <div class="mx-3 flex grow flex-col">
          <slot />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { data: taxonomies } = await useFetch(`/api/taxonomies`)
</script>
