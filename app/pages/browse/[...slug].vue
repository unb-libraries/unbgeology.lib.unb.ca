<template>
  <NuxtLayout name="page">
    <template #title>
      Browse <span class="italic">{{ parentPages.at(-1).label }}</span>
    </template>
    
    <template #default>
      <div class="flex flex-col gap-y-6">
        <section class="flex gap-x-2 py-2 w-full items-center">
          <div v-if="parentPages.length" class="flex flex-none gap-x-2">
            <component :is="i < parentPages.length - 1 ? 'a' : 'span'" v-for="({ label, href }, i) in parentPages"
              :key="href"
              :href="i < parentPages.length - 1 ? href : undefined"
              :class="['px-2 py-1 bg-base-27 dark:bg-base-77 text-sm text-base-97 dark:text-base-17 dark:focus-visible:text-base-97 border border-transparent rounded-md flex-nowrap text-nowrap', { 'hover:bg-accent-26 dark:hover:bg-accent-36 focus-visible:bg-accent-26 dark:focus-visible:bg-accent-36': i < parentPages.length - 1 }]"
            >
              {{ label }}
            </component>
          </div>
          <IconChevron2x v-if="subClassifications?.entities.length" class="flex-none size-5 fill-none stroke-base-27 dark:stroke-base-77 stroke-1.5" />
          <div v-if="subClassifications?.entities.length" class="grow overflow-hidden">
            <Carousel>
              <a v-for="subCls in subClassifications?.entities ?? []"
                :key="subCls.self"
                :href="[useRoute().path, subCls.slug].join('/')"
                class="px-2 py-1 text-sm hover:text-accent-36 border border-base-57 hover:border-accent-36 rounded-md flex-nowrap text-nowrap"
              >
                {{ subCls.label }}
              </a>
            </Carousel>
          </div>
        </section>

        <!-- Description -->
        <section v-if="classification?.description || parentPages.length === 1" class="grow">
          <h2 class="sr-only">Description</h2>
          <template v-if="classification?.description">
            {{ classification.description }}
          </template>
          <template v-else-if="categorySlug === 'fossils'">
            A fossil is the <em>preserved remains, impression, or trace of a once-living organism</em> from a past geologic age. Fossils may include body parts (bones, shells, leaves), chemical signatures, or traces (footprints, burrows).
          </template>
          <template v-else-if="categorySlug === 'minerals'">
            A mineral is a <em>naturally occurring, inorganic solid</em> with a <em>definite chemical composition</em> and an <em>ordered atomic structure</em> (crystalline structure). Example: Quartz (SiO₂), Calcite (CaCO₃).
          </template>
          <template v-else-if="categorySlug === 'rocks'">
            A rock is a <em>naturally occurring solid aggregate of one or more minerals</em>, mineraloids, or organic matter. Rocks are classified into three main types based on their origin: Igneous, Sedimentary, Metamorphic.
          </template>
        </section>
        
        <section class="flex flex-col lg:flex-row gap-2 w-full overflow-hidden">
          <div class="grow h-[24rem] md:h-[36rem]">
            <SpecimenImage
              :category="(category as 'fossil' | 'mineral' | 'rock')"
              :url="specimens?.entities.filter(({ images }) => images?.total)[activeImageIndex]?.images?.entities[0]?.uri"
              class="size-full"
            />
          </div>
          <div v-if="specimens?.entities.filter(({ images }) => images?.entities.length ?? 0 > 0)?.length ?? 0 > 1" class="flex-none h-[24rem] md:h-[36rem]">
            <Carousel :orientation="'horizontal'" class="flex lg:hidden gap-x-1 w-full overflow-x-hidden">
              <button v-for="(images, i) in specimens?.entities.filter(({ images }) => images?.total).map(({ images }) => images)"
                :key="images.entities[0].self"
                :data-status="activeImageIndex === i ? 'active' : 'inactive'"
                type="button"
                class="group size-[120px] aspect-square data-[status=inactive]:cursor-pointer border border-transparent data-[status=active]:border-accent-26 dark:data-[status=active]:border-accent-36"
                @click="activeImageIndex = i"
              >
                <SpecimenImage
                  :category="(category as 'fossil' | 'mineral' | 'rock')"
                  :url="images.entities[0].uri"
                  width="120"
                  height="120"
                  class="group-data-[status=active]:opacity-50 group-data-[status=inactive]:hover:opacity-50"
                />
              </button>
            </Carousel>
            <div class="hidden lg:grid lg:grid-cols-2 xl:grid-cols-4 gap-2">
              <button v-for="(images, i) in specimens?.entities.filter(({ images }) => images?.total).map(({ images }) => images)"
                :key="images.entities[0].self"
                :data-status="activeImageIndex === i ? 'active' : 'inactive'"
                type="button"
                class="group size-[120px] aspect-square data-[status=inactive]:cursor-pointer border border-transparent data-[status=active]:border-accent-26 dark:data-[status=active]:border-accent-36"
                @click="activeImageIndex = i"
              >
                <SpecimenImage
                  :category="(category as 'fossil' | 'mineral' | 'rock')"
                  :url="images.entities[0].uri"
                  width="120"
                  height="120"
                  class="group-data-[status=active]:opacity-50 group-data-[status=inactive]:hover:opacity-50"
                />
              </button>
            </div>
          </div >
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
  name: 'Browse by category or classification',
})

const { slug: [categorySlug, ...slug] } = useRoute().params as { slug: string[] }
if (!['fossils', 'minerals', 'rocks'].includes(categorySlug)) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found' })
}

const category = categorySlug.slice(0, -1) // remove plural 's'
const { data: classifications } = slug.length
  ? await useFetch<EntityJSONList<Classification>>('/api/terms/classifications', {
    query: {
      filter: [`type:equals:classification/${category}`, `slug:equals:${slug.at(-1)}`],
      select: ['label', 'slug', 'description', 'image', 'parents', 'children'],
    }
  })
  : { data: { value: undefined } }

if (slug.length && !classifications.value?.entities.length) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found' })
}

const classification = computed(() => classifications.value?.entities[0])
const { data: subClassifications } = classification.value?.children
  ? await useFetch<EntityJSONList<Classification>>(classification.value.children.self, { query: { pageSize: 50 } })
  : await useFetch<EntityJSONList<Classification>>('/api/terms/classifications', {
    query: {
      filter: [`type:equals:classification/${category}`, `depth:equals:0`],
      select: ['label', 'slug', 'description', 'image', 'parents', 'children'],
      pageSize: 50,
    }
  })

const { data: specimens } = await useFetch<EntityJSONList<Specimen>>('/api/specimens', {
  query: {
    filter: [slug.length ? `classification:equals:${classification.value?.self}` : `type:equals:${category}`],
    select: ['name', 'images'],
    pageSize: 15,
  }
})

const { data: parentClassifications } = slug.length && await useFetch<EntityJSONList<Classification>>(classification.value?.parents?.self) || ({ data: { value: { entities: [] } } })
if (parentClassifications && !(parentClassifications.value?.entities ?? []).every((p, i) => p.slug === slug[i])) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found' })
}

const parentPages = [
  {
    href: `/browse/${category}s`,
    label: category[0].toUpperCase() + category.slice(1).toLowerCase() + 's',
  },
  ...([...parentClassifications.value?.entities ?? [], classification.value].filter(Boolean))
    .map(({ label }, i) => ({
      href: `/browse/${category}s/${[...parentClassifications.value!.entities ?? [], classification.value].filter(Boolean)
        .slice(0, i + 1)
        .map(({ slug }) => slug)
        .join('/')}`,
      label,
    })),
]

const activeImageIndex = ref(0)

const title = parentPages.at(-1)?.label
const description = classification.value?.description
const truncatedDescription = description && description.substring(0, 160) + (description?.length > 160 ? '...' : '')

useCustomHead({
  title,
  description: truncatedDescription ?? '',
  image: specimens.value?.entities.filter(({ images }) => images?.total)[0]?.images?.entities[0]?.uri,
})
</script>