<template>
  <section v-if="specimen" class="container mx-auto my-4">
    <h1 class="text-4xl">
      {{ specimen.name }}
    </h1>
  </section>
  <section v-if="specimen" class="container mx-auto">
    <ul>
      <li v-if="specimen.objectId">
        <span>ID:</span><span>{{ specimen.objectId }}</span>
      </li>
      <li v-if="specimen.age">
        <span>Age:</span><span>{{ specimen.age }}</span>
      </li>
      <li v-if="specimen.pieces">
        <span>Pieces:</span><span>{{ specimen.pieces }}</span>
      </li>
      <li v-if="specimen.dimensions">
        <span>Dimensions:</span><span>{{ specimen.dimensions.width }}mm x {{ specimen.dimensions.length }}mm</span>
      </li>
      <li v-if="specimen.origin">
        <LeafletMap class="h-80" :center="[specimen.origin.latitude, specimen.origin.longitude]">
          <LeafletMarker
            :name="specimen.name"
            :center="[specimen.origin.latitude, specimen.origin.longitude]"
            :accuracy="specimen.origin.accuracy"
          />
        </LeafletMap>
      </li>
      <li>
        <span>Created:</span><span>{{ specimen.created }}</span>
      </li>
      <li>
        <span>Updated:</span><span>{{ specimen.updated }}</span>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { Specimen } from 'entity-types/Specimen'
const objectId = useRoute().params.objectId
const { data: specimen, error } = await useFetch<Specimen>(`/api/specimens/${objectId}`)
if (error.value) {
  showError({ statusCode: 404 })
}
</script>
