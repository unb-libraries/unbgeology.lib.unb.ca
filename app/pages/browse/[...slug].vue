<template>
  <NuxtLayout name="page">
    <template #title>
      Browse <span class="italic">{{ classification.label }}</span>
    </template>
    
    <template #breadcrumbs>
      <div class="inline-flex items-center gap-x-2">
        <a :href="`/`" class="text-sm hover:underline">Home</a>
        <span class="text-sm">/</span>
        <a :href="`/browse`" class="text-sm hover:underline">Browse</a>
        <span class="text-sm">/</span>
        <template v-for="(parent, i) in parentPages" :key="parent.self">
          <a :href="`/browse/${parent.slug}`" class="text-sm hover:underline">
            {{ parent.label[0].toUpperCase() + parent.label.slice(1) }}
          </a>
          <span v-if="i < parentPages.length - 1" class="text-sm">/</span>
        </template>
      </div>
    </template>
    
    <template #default>
      <div class="flex flex-col gap-y-12">
        <section class="flex flex-col gap-y-2 w-full overflow-hidden">
          <div class="h-[48rem]">
            <SpecimenImage
              :category="(category as 'fossil' | 'mineral' | 'rock')"
              :url="specimens?.entities.filter(({ images }) => images?.total)[activeImageIndex]?.images?.entities[0]?.uri"
              class="size-full"
            />
          </div>
          <div v-if="specimens?.entities.filter(({ images }) => images?.entities.length ?? 0 > 0)?.length ?? 0 > 1" class="flex gap-x-1 max-w-full h-24">
            <button v-for="(images, i) in specimens?.entities.filter(({ images }) => images?.total).map(({ images }) => images)"
              :key="images.entities[0].self"
              :data-status="activeImageIndex === i ? 'active' : 'inactive'"
              type="button"
              class="group h-full aspect-square data-[status=inactive]:cursor-pointer border border-transparent data-[status=active]:border-accent-26 dark:data-[status=active]:border-accent-36"
              @click="activeImageIndex = i"
            >
              <SpecimenImage
                :category="(category as 'fossil' | 'mineral' | 'rock')"
                :url="images.entities[0].uri"
                width="100"
                height="100"
                class="group-data-[status=active]:opacity-50 group-data-[status=inactive]:hover:opacity-50"
              />
            </button>
          </div >
        </section>
        
        <!-- Description -->
        <section class="grow">
          <h2 class="sr-only text-2xl mb-4">Description</h2>
          {{ classification.description }}
        </section>
  
        <!-- Sub-Classifications -->
        <section v-if="subClassifications?.entities.length">
          <h2 class="text-2xl mb-4">Types of {{ classification.label }}</h2>
          <div class="flex gap-x-2 max-w-full">
            <Carousel>
              <a v-for="subCls in subClassifications.entities"
                :key="subCls.self"
                :href="[useRoute().path, subCls.slug].join('/')"
                class="px-4 py-2 hover:bg-base-77 border border-base-57 rounded-md flex-nowrap text-nowrap"
              >
                {{ subCls.label }}
              </a>
            </Carousel>
          </div>
        </section>
      </div>
    </template>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import type { EntityJSONList } from '@unb-libraries/nuxt-layer-entity'
import type { Classification } from '~/types/classification'
import type { Specimen } from '~/types/specimen'

definePageMeta({
  layout: false,
})

const { slug: [category, ...slug] } = useRoute().params as { slug: string[] }
if (!['fossil', 'mineral', 'rock'].includes(category)) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found' })
}

const { data: classifications } = await useFetch<EntityJSONList<Classification>>('/api/terms/classifications', {
  query: {
    filter: [`type:equals:classification/${category}`, slug.length && `slug:equals:${slug.at(-1)}`].filter(Boolean),
    select: ['label', 'slug', 'description', 'image', 'parents', 'children'],
  }
})

if (slug.length && !classifications.value?.entities.length) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found' })
}

const classification = computed(() => slug.length && classifications.value?.entities[0] || ({ self: category, label: category[0].toUpperCase() + category.slice(1), slug: category } as Classification))
const { data: subClassifications } = await useFetch<EntityJSONList<Classification>>(classification.value?.children?.self ?? '/api/terms/classifications', !slug.length
  ? { query: { filter: [`type:equals:classification/${category}`, `depth:equals:0`], select: ['label', 'slug', 'description', 'image', 'parents', 'children'] } }
  : undefined)
const { data: specimens } = await useFetch<EntityJSONList<Specimen>>('/api/specimens', {
  query: {
    filter: [slug.length ? `classification:equals:${classification.value?.self}` : `type:equals:${category}`],
    select: ['name', 'images'],
    pageSize: 15,
  }
})

const { data: parentClassifications } = slug.length && await useFetch<EntityJSONList<Classification>>(slug.length && classification.value?.parents?.self) || ({ data: { entities: [] } })
if (parentClassifications && !(parentClassifications.value?.entities ?? []).every((p, i) => p.slug === slug[i])) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found' })
}
const parentPages = [{ self: category, label: `${category}s`, slug: category }, ...parentClassifications.value?.entities ?? []]
  .map(({ slug, ...p }, i, arr) => ({ ...p, slug: arr.slice(0, i + 1).map(pc => pc.slug).join('/') }))

const activeImageIndex = ref(0)
</script>