<template>
  <div class="flex flex-col min-h-screen">
    <page-header class="bg-base-7 dark:bg-base-87 shadow-lg dark:shadow-primary-80" />
    <main class="flex flex-col px-4 grow">
      <slot />
    </main>
    <page-footer class="dark:bg-primary" />
  </div>
</template>
