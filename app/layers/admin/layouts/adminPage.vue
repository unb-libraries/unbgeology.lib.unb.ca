<template>
  <NuxtLayout name="admin">
    <div class="p-100 relative flex h-full flex-col">
      <h1 class="text-150 mb-100 flex-none">
        <slot name="page-title">
          {{ $route.name }}
        </slot>
      </h1>
      <div class="grow">
        <slot />
      </div>
    </div>
  </NuxtLayout>
</template>
