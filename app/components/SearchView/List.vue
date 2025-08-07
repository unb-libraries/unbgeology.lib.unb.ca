<template>
  <ul class="overflow-y-scroll size-full">
    <!-- Element container -->
    <li v-for="specimen in specimens" :key="specimen.self" class="group flex w-full h-fit px-4 border border-transparent hover:bg-base-97 hover:border-accent-22">
      <!-- Inner container-->
      <div class="inner flex gap-x-4 border-t border-t-base-77 group-first:border-t-transparent group-hover:border-t-transparent w-full py-4">
        <SpecimenImage :category="specimen.type" :url="specimen.images?.entities?.[0]?.uri" width="100" height="100" class="aspect-square h-24" />
        <div class="flex flex-col overflow-hidden gap-y-2">
          <div class="inline-flex gap-x-1 items-center text-base-27 text-xs uppercase font-semibold leading-none">
            <span class="sr-only">ID</span>
            <span>{{ specimen.id.toUpperCase() }}</span>
          </div>
          <h2 class="flex items-center gap-x-1">
            <a :href="`/specimens/${specimen.id}`" class="text-xl text-base-17 hover:text-accent-22 leading-none border-b border-current">{{ specimen.name ?? 'Unknown' }}</a>
            <IconLock v-if="useEnum(Status).valueOf(specimen.status) !== Status.PUBLISHED" title="Unpublished" class="text-red stroke-2 size-4" />
            <SpecimenEditLink :specimen class="hidden group-hover:inline-flex" />
          </h2>
          <TruncatedText v-if="specimen.description">
            {{ specimen.description }}
          </TruncatedText>
          <div class="inline-flex gap-x-6 text-xs text-base-27 uppercase font-semibold leading-none">
            <div class="inline-flex gap-x-1 leading-none items-center">
              <SpecimenIcon :category="specimen.type" class="size-4" />
              <span class="sr-only">Classification</span>
              <span>
                {{ specimen.type[0].toUpperCase() + specimen.type.slice(1).toLowerCase() }} / {{ specimen.classification?.label }}
              </span>
            </div>
            <div class="inline-flex gap-x-1 leading-none items-center">
              <IconMapPin class="size-4 fill-none stroke-current stroke-2" />
              <span class="sr-only">Origin</span>
              <span>{{ specimen.origin?.name }}</span>
            </div>
            <div v-if="specimen.age?.relative?.length" class="inline-flex gap-x-1 leading-none items-center">
              <IconAsterisk class="size-4 fill-none stroke-current stroke-2" />
              <span class="sr-only">Geological age</span>
              <span v-if="specimen.age.relative.length === 1">{{ specimen.age.relative[0].label }}</span>
              <span v-else>{{specimen.age.relative.map(({ label }) => label).join(' to ')}}</span>
            </div>
          </div>
        </div>
      </div>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { type Specimen, Status } from '~/types/specimen'

defineProps<{
  specimens: Specimen[]
}>()
</script>

<style>
li.group:hover+li .inner {
  border-top-color: transparent !important;
}
</style>