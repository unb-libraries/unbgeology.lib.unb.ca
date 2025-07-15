<template>
  <div class="flex flex-col">
    <page-header class="sticky top-0 bg-base dark:bg-primary-80 z-10" />
    <main class="flex flex-col">
      <slot />
    </main>
    <page-footer />
  </div>
</template>
