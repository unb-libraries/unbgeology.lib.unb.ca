<template>
  <div class="flex flex-col gap-y-40 mb-40">
    <!-- Hero -->
    <section class="flex flex-col container mx-auto justify-center">
      <h1 class="sr-only text-4xl">UNB Earth Science Collections</h1>
      <div class="relative h-[650px] w-full mt-16">
        <HeroImages />
        <form action="/specimens" method="GET" class="absolute bottom-1/3 left-[10%] flex flex-row w-4/5 justify-center space-x-2 space-y-0">
          <InputSearch />
          <button
            type="submit"
            class="flex-none text-xl text-base-97 dark:text-base-7 dark:hover:text-base-7 px-4 py-2 rounded-md bg-base-27 dark:bg-base-77 hover:bg-accent-26 dark:hover:bg-accent-36 focus-visible:bg-accent-26 dark:focus-visible:bg-accent-36 dark:focus-visible:text-base-97"
          >
            Search
          </button>
        </form>
      </div>
    </section>
    
    <!-- Browse by Category -->
    <section class="flex flex-col container mx-auto">
      <h2 class="text-4xl mb-12">Browse by Category</h2>
      <div class="grid grid-cols-3 gap-x-12">
        <CategoryCard v-for="category in ['fossil', 'mineral', 'rock']"
          :key="category"
          :category="(category as 'fossil' | 'mineral' | 'rock')"
        />
      </div>
    </section>

    <!-- Browse by Origin -->
    <section v-if="markers?.length" class="flex flex-col container mx-auto">
      <h2 class="text-4xl mb-12">Browse by Origin</h2>
      <SpecimenMap :specimens="markers" class="z-0 h-[calc(100dvh-15.5rem-2px)]" />
    </section>
  </div>
</template>

<script lang="ts" setup>
import type { EntityJSONList } from '@unb-libraries/nuxt-layer-entity'
import type { Specimen } from '~/types/specimen'

const { data: specimens } = await useFetch<EntityJSONList<Specimen>>('/api/specimens', {
  query: {
    filter: ['origin:greater:90.1;180.1', 'origin:less:-90.1;-180.1'],
    select: ['id', 'name', 'images', 'type', 'classification', 'origin', 'status'],
  }
})

const markers = computed(() => specimens.value?.entities.filter(({ origin }) => origin?.latitude && origin?.longitude))
</script>
