<template>
  <NuxtLayout name="dashboard">
    <div class="space-y-3">
      <header class="mb-6 space-y-6">
        <div class="flex flex-row space-x-8">
          <h1 id="title" class="text-2xl">
            <slot name="page-title">
              {{ $route.name }}
            </slot>
          </h1>
          <div class="grow space-x-2 text-right">
            <slot name="actions" />
          </div>
        </div>
      </header>
      <slot />
    </div>
    <template #sidebar>
      <slot name="sidebar" />
    </template>
  </NuxtLayout>
</template>
