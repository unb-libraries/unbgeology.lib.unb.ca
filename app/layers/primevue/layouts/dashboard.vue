<template>
  <NuxtLayout name="default">
    <header class="container mx-auto">
      <h1 class="my-8 text-4xl">
        Dashboard
      </h1>
    </header>
    <div id="content" class="container mx-auto mb-16 mt-4">
      <div class="flex flex-row">
        <nav class="twa-column list-none text-right">
          <section class="twa-nav-group">
            <h2 class="twa-nav-group-heading">
              Specimens
            </h2>
            <NuxtLink :to="`/dashboard/specimens`" class="twa-nav-item" active-class="twa-nav-item-active">
              View all
            </NuxtLink>
            <NuxtLink :to="`/dashboard/specimens/create`" class="twa-nav-item" active-class="twa-nav-item-active">
              New specimen
            </NuxtLink>
          </section>
          <section class="twa-nav-group">
            <h2 class="twa-nav-group-heading">
              Taxonomies
            </h2>
            <NuxtLink v-for="taxonomy in taxonomies" :key="taxonomy.self" :to="`/dashboard/${taxonomy.self.substring(5)}`" class="twa-nav-item" active-class="twa-nav-item-active">
              {{ taxonomy.name }}
            </NuxtLink>
          </section>
          <section class="twa-nav-group">
            <h2 class="twa-nav-group-heading">
              Files
            </h2>
            <NuxtLink :to="`/dashboard/files/images`" class="twa-nav-item" active-class="twa-nav-item-active">
              Images
            </NuxtLink>
          </section>
          <section class="twa-nav-group">
            <h2 class="twa-nav-group-heading">
              Users
            </h2>
            <NuxtLink :to="`/dashboard/users`" class="twa-nav-item" active-class="twa-nav-item-active">
              View all
            </NuxtLink>
          </section>
        </nav>
        <div class="twa-column grow">
          <slot />
        </div>
        <aside class="twa-column w-80">
          <slot name="sidebar" />
        </aside>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { data: taxonomies } = await useFetch<{ name: string, self: string }[]>(`/api/taxonomies`)
</script>

<style scoped>
  .twa-column {
    @apply flex flex-col dark:bg-primary empty:w-0 p-6 empty:p-0 empty:ml-0 mx-2 first:ml-0 last:mr-0
  }
  .twa-nav-group {
    @apply flex flex-col my-6 first:mt-0 last:mb-0
  }

  .twa-nav-group-heading {
    @apply text-sm uppercase border-b border-primary-60 py-2 text-primary-40
  }

  .twa-nav-item {
    @apply hover:bg-accent-light py-2 px-3 my-1
  }

  .twa-nav-item-active {
    @apply bg-accent-mid
  }
</style>
