<template>
  <form @submit.prevent="onSubmit">
    <div class="flex flex-col">
      <label class="mb-2 text-lg font-bold" for="label">Label</label>
      <PvInputText :id="`${uri}:label`" v-model="label" name="Label" />
    </div>
    <div class="mr-3 flex w-1/2 flex-col">
      <label class="mb-2 text-lg font-bold" for="parent">Parent</label>
      <PvInputSelect :id="`${uri}:parent`" v-model="parent" name="parent" :options="terms" option-label="label" />
    </div>
    <slot />
    <div class="mt-8 flex flex-row">
      <button type="submit" class="bg-accent-dark dark:bg-accent-mid hover:bg-accent-light mr-2 rounded-md p-3 font-bold text-white">
        Save
      </button>
      <a href="/" class="font-base ml-2 p-3">
        Cancel
      </a>
    </div>
  </form>
</template>

<script setup lang="ts">
import { type Taxonomy } from '~/layers/mongo/types/taxonomy'

const props = defineProps<{
  uri: string
}>()

const emits = defineEmits<{
  created: [taxonomy: Taxonomy],
}>()

const label = ref(``)
const parent = ref(``)
const terms = ref<Taxonomy[]>([])

watch(() => props.uri, async (newUri) => {
  if (newUri) {
    const { data } = await useFetch<{ items: Taxonomy[] }>(newUri)
    terms.value = data.value?.items ?? []
  }
}, { immediate: true })

const onSubmit = async function () {
  const { data: term } = await useFetch<Taxonomy>(props.uri, {
    method: `POST`,
    body: {
      label: label.value,
      parent: parent.value,
    },
  })

  if (term.value) {
    label.value = ``
    parent.value = ``
    emits(`created`, term.value)
    terms.value.push(term.value)
  }
}
</script>
