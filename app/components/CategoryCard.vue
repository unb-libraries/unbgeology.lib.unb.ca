<template>
  <article class="flex flex-col gap-y-6 h-full">
    <SpecimenImage
      :category="(category as 'fossil' | 'mineral' | 'rock')"
      :url="`/top-cat-images-${category}s.jpg`"
      width="525"
      height="375"
      class="flex-none w-full aspect-7/5"
    />
    <h2 class="flex-none text-2xl">{{ category.charAt(0).toUpperCase() + category.slice(1) }}s</h2>
    <div class="flex flex-col grow">
      <div v-if="category === 'fossil'" class="grow">
        <p>Fossils are the preserved remains or traces of ancient organisms that provide valuable insights into Earth's past life forms and environments. They are the key to understanding the history of life on our planet.</p>
        <p>Studying fossils is a multidisciplinary endeavor that combines geology, paleontology, biology, and other scientific disciplines. It helps us unravel the story of life on Earth and provides a fascinating glimpse into the ancient past.</p>
      </div>
      <div v-if="category === 'mineral'" class="grow">
        <p>Minerals are naturally occurring, inorganic solid substances with a specific chemical composition and a characteristic crystal structure. They are the building blocks of rocks and are found in various geological environments.</p>
        <p>Studying minerals provides insights into Earth's geological processes, as well as their importance in industries and everyday life.</p>
      </div>
      <div v-if="category === 'rock'" class="grow">
        <p>Rocks are solid, naturally occurring substances that make up the Earth's crust. They are composed of minerals, which are the building blocks of rocks. Geologists study rocks to understand Earth's history, the processes that shape the planet's surface, and the resources they may contain.</p>
        <p>It's important to note that rocks vary greatly in their properties, appearance, and composition depending on their specific type and the geological processes that formed them.</p>
      </div>
      <a
        :href="`/browse/${category}`"
        class="flex-none w-fit text-accent-26 hover:text-accent-36 dark:hover:text-accent-46 dark:text-accent-36 text-lg font-semibold underline border-none rounded-md"
      >
        Browse {{ category.charAt(0).toUpperCase() + category.slice(1) }}s
      </a>
    </div>
  </article>
</template>

<script lang="ts" setup>
defineProps<{
  category: 'fossil' | 'mineral' | 'rock'
}>()
</script>