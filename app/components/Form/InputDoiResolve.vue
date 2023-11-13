<template>
  <div class="border-primary-20 hover:border-accent-mid dark:border-primary-60/75 dark:hover:border-accent-light ring-accent-mid focus:ring-accent-light dark:focus:ring-accent-mid flex flex-row rounded-lg border p-3 focus:ring-2" :class="{ 'bg-primary-80 dark:bg-primary-80': pending }">
    <PvProgressSpinner v-if="pending" class="mr-2 h-6 w-6" stroke-width="4" />
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="mr-2 h-6 w-6"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
    <input v-model="doi" class="dark:bg-primary placeholder:text-primary dark:placeholder:text-primary-20 text-primary w-full bg-white focus-visible:outline-none dark:text-base" :class="{ 'bg-primary-80 dark:bg-primary-80': pending }" :disabled="pending">
    <svg
      v-if="doi"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="text-primary h-6 w-6 cursor-pointer dark:text-white"
      @click="onReset"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import doiRegex from "doi-regex"
import { type EntityJSONProperties } from "layers/base/types/entity"
import { type Publication } from "types/specimen"

const emits = defineEmits<{
  success: [citation: EntityJSONProperties<Publication>]
  reset: []
  error: []
}>()

const doi = ref(``)
const pending = ref(false)
watch(doi, search)

function search(doi: string) {
  if (!doi) { return }

  const url = doi.replace(`doi:`, `https://doi.org/`)
  if (isDoi(url)) {
    useFetch<string>(url, {
      headers: {
        Accept: `text/x-bibliography`,
      },
    }).then((value) => {
      pending.value = false
      if (value?.data.value) {
        emits(`success`, { citation: value.data.value.trim() })
      } else {
        emits(`error`)
      }
    }).catch((reason) => {
      pending.value = false
      emits(`error`)
    })

    pending.value = true
  }
}

function isDoi(doi: string) {
  return doi.match(/^http(s)?:\/\/doi\.org\/.*/) && doiRegex().test(doi)
}

function onReset() {
  doi.value = ``
  emits(`reset`)
}
</script>
