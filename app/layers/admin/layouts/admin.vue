<template>
  <div class="flex h-screen flex-col">
    <header class="bg-base dark:bg-base-dark w-full flex-none">
      Earth Science Collection
    </header>
    <main class="flex grow flex-row">
      <nav class="flex w-48 flex-col">
        <NuxtLink to="/admin/dashboard">
          Dashboard
        </NuxtLink>
        <NuxtLink to="/admin/specimens">
          Specimens
        </NuxtLink>
        <NuxtLink to="/admin/collections">
          Collections
        </NuxtLink>
        <NuxtLink to="/admin/users">
          Users
        </NuxtLink>
      </nav>
      <div>Content</div>
    </main>
    <footer class="flex-none">
      UNB Libraries
    </footer>
  </div>
</template>

<script lang="ts" setup>
import '~/assets/css/theme.admin.css'
</script>
