<template>
  <PvDetailsPage>
    <PvEntityDetails :entity="publication" :fields="['citation', 'abstract']" label-class="text-md text-primary-60" item-class="my-2 first:mt-0 last:mb-0" />
    <template #actions>
      <button class="border-yellow text-yellow hover:bg-yellow hover:text-primary mb-1 w-full rounded-md border p-1">
        Edit
      </button>
      <button class="border-red text-red hover:bg-red mt-1 w-full rounded-md border p-1 hover:text-white" @click="removePublication(publication)">
        Delete
      </button>
    </template>
  </PvDetailsPage>
</template>

<script setup lang="ts">
import { type EntityJSON } from 'layers/base/types/entity'
import { type Publication } from 'types/specimen'

const { publication, remove } = inject<{ publication: EntityJSON<Publication>, remove: typeof deleteEntity }>(`context`) as { publication: EntityJSON<Publication>, remove: typeof deleteEntity }
const unstack = inject<() => void>(`unstack`) as () => void

function removePublication(publication: EntityJSON<Publication>) {
  remove(publication)
  unstack()
}

</script>
