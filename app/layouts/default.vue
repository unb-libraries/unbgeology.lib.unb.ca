<template>
  <div class="flex flex-col min-h-screen">
    <page-header class="sticky top-0 bg-white dark:bg-primary z-10 shadow-lg dark:shadow-primary-80" />
    <main class="flex flex-col grow">
      <slot />
    </main>
    <page-footer class="dark:bg-primary" />
  </div>
</template>
