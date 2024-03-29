<template>
  <div class="inline-flex items-center py-0" :class="{ 'bg-primary-80 dark:bg-primary-80': pending }">
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
    <input v-model="doi" class="placeholder:text-primary dark:placeholder:text-primary-20 text-primary w-full border-none bg-inherit p-3 focus-visible:outline-none dark:bg-inherit dark:text-base" :class="{ 'bg-primary-80 dark:bg-primary-80': pending }" :disabled="pending">
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
import { type EntityJSONProperties } from "@unb-libraries/nuxt-layer-entity"
import { type Publication } from "types/specimen"

const emits = defineEmits<{
  success: [citation: EntityJSONProperties<Publication>]
  reset: []
  error: [msg?: string]
}>()

const doi = ref(``)
const pending = ref(false)
watch(doi, search)

async function search(doi: string) {
  if (!doi) { return }

  const url = doi.replace(`doi:`, `https://doi.org/`)
  if (isDoi(url)) {
    pending.value = true
    try {
      const [citation, abstract] = await Promise.all([
        await fetchCitation(url),
        await fetchAbstract(url),
      ])

      if (citation) {
        emits(`success`, { citation, abstract })
      } else {
        emits(`error`, `DOI could not be resolved.`)
      }
    } catch (err: any) {
      emits(`error`)
    } finally {
      pending.value = false
    }
  }
}

async function fetchCitation(url: string) {
  const { data: citation } = await useFetch<string>(url, {
    headers: {
      Accept: `text/x-bibliography`,
    },
  })
  return citation.value ?? ``
}

async function fetchAbstract(url: string) {
  const { data: blob } = await useFetch<Blob>(url, {
    headers: {
      Accept: `application/vnd.crossref.unixref+xml`,
    },
  })

  if (blob.value) {
    const xml = await blob.value.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, `application/xml`)
    const abstractNode = doc.querySelector(`abstract`)
    if (abstractNode) {
      return abstractNode.textContent ?? ``
    }
  }

  return ``
}

function isDoi(doi: string) {
  return doi.match(/^http(s)?:\/\/doi\.org\/.*/) && doiRegex().test(doi)
}

function onReset() {
  doi.value = ``
  emits(`reset`)
}
</script>
