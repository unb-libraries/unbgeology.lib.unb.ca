<template>
  <div class="flex flex-row space-x-2">
    <TwInputText
      v-model="doi"
      class="input input-text-lg grow"
      :class="inputClass"
      wrapper-class="w-full"
      :placeholder="placeholder"
      :disabled="pending"
    >
      <template #before>
        <PvProgressSpinner v-if="pending" class="mr-2 size-6" stroke-width="4" />
      </template>
    </TwInputText>
    <button class="button button-lg button-accent-mid hover:button-accent-light" :class="submitClass" @click.stop.prevent="onSearch">
      Search
    </button>
  </div>
</template>

<script setup lang="ts">
interface Citation {
  citation: string
  abstract: string
  doi: string
}

defineProps<{
  inputClass?: string
  submitClass?: string
  placeholder?: string
}>()

const emits = defineEmits<{
  resolve: [citation: Citation]
  error: [msg?: string]
}>()

const doi = defineModel<string>(`doi`, { required: false })
const { resolve, abstract, citation, pending } = useDoi()
async function onSearch() {
  if (doi.value) {
    await resolve(doi.value)
    if (citation.value || abstract.value) {
      emits(`resolve`, { citation: citation.value, abstract: abstract.value, doi: doi.value })
    } else {
      emits(`error`, `DOI could not be resolved.`)
    }
  }
}

</script>
