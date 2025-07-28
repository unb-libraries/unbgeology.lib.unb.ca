<template>
  <NuxtLayout name="page">
    <template #title>
      Browse <span class="italic">{{ classification.label }}</span>
    </template>
    
    <template #breadcrumbs>
      <div class="inline-flex items-center gap-x-2">
        <template v-for="(parent, i) in parentPages" :key="parent.self">
          <a :href="`/browse/${parent.slug}`" class="text-sm hover:underline">
            {{ parent.label[0].toUpperCase() + parent.label.slice(1) }}
          </a>
          <span v-if="i < parentPages.length - 1" class="text-sm">/</span>
        </template>
      </div>
    </template>
    
    <template #default>
      <div class="flex gap-x-6 w-full">
        <div class="bg-primary-20 dark:bg-primary-60 aspect-7/5 text-base dark:text-primary-40 justify-center items-center w-1/2 flex">
          <IconFossil v-if="category === 'fossil'" class="size-48 fill-none stroke-current stroke-1.5" />
          <IconMineral v-else-if="category === 'mineral'" class="size-48 fill-none stroke-current stroke-1.5" />
          <IconRock v-else class="size-48 fill-none stroke-current stroke-1.5" />
        </div>
        <div class="flex flex-col gap-y-4 w-1/2">
          <section v-if="classification.description" class="grow">
            <h2 class="sr-only text-2xl mb-4">Description</h2>
            {{ classification.description }}
          </section>
  
          <section v-if="subClassifications?.entities.length">
            <h2 class="text-2xl mb-4">Types of {{ classification.label }}</h2>
            <div class="flex gap-x-2 max-w-full">
              <Carousel>
                <a v-for="subCls in subClassifications.entities"
                  :key="subCls.self"
                  :href="[useRoute().path, subCls.slug].join('/')"
                  class="bg-primary-60 px-4 py-2 border-none rounded-md flex-nowrap text-nowrap hover:bg-accent-dark hover"
                >
                  {{ subCls.label }}
                </a>
              </Carousel>
            </div>
          </section>
          
          <section>
            <h2 class="text-2xl mb-4">{{ classification.label }} specimens</h2>
            <div class="grid grid-cols-5 gap-x-2">
              <div v-for="i in 5" class="bg-primary-20 dark:bg-primary-60 aspect-square text-base dark:text-primary-40 justify-center items-center flex">
                <IconFossil v-if="category === 'fossil'" class="size-24 fill-none stroke-current stroke-1.5" />
                <IconMineral v-else-if="category === 'mineral'" class="size-24 fill-none stroke-current stroke-1.5" />
                <IconRock v-else class="size-24 fill-none stroke-current stroke-1.5" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </template>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import type { EntityJSONList } from '@unb-libraries/nuxt-layer-entity'
import type { Classification } from '~/types/classification'

definePageMeta({
  layout: false,
})

const { slug: [category, ...slug] } = useRoute().params as { slug: string[] }
if (!['fossil', 'mineral', 'rock'].includes(category)) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found' })
}

const { data: classifications } = await useFetch<EntityJSONList<Classification>>('/api/terms/classifications', {
  query: {
    filter: [`type:equals:classification/${category}`, `slug:equals:${slug.at(-1)}`],
    select: ['label', 'slug', 'description', 'parents', 'children'],
  }
})
if (!classifications.value?.entities.length) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found' })
}

const classification = computed(() => classifications.value!.entities[0]!)
const { data: parentClassifications } = await useFetch<EntityJSONList<Classification>>(classification.value.parents.self)
if (!(parentClassifications.value?.entities ?? []).every((p, i) => p.slug === slug[i])) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found' })
}
const parentPages = [{ self: category, label: `${category}s`, slug: category }, ...parentClassifications.value?.entities ?? []]
  .map(({ slug, ...p }, i, arr) => ({ ...p, slug: arr.slice(0, i + 1).map(pc => pc.slug).join('/') }))
const { data: subClassifications } = await useFetch<EntityJSONList<Classification>>(classification.value.children.self)
</script>