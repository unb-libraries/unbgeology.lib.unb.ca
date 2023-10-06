<template>
  <form @submit.prevent="submit()">
    <div class="mt-6 flex flex-col">
      <label class="mb-2 text-lg font-bold" for="label">Label</label>
      <PvInputText :id="`${uri}:label`" v-model="label" name="Label" />
    </div>
    <div class="my-6 flex flex-col">
      <label class="mb-2 text-lg font-bold" for="parent">Parent</label>
      <PvInputSelect :id="`${uri}:parent`" v-model="parent" name="parent" :options="terms" option-label="label" />
    </div>
    <slot />
    <div class="mt-8 flex flex-row">
      <button type="submit" class="bg-accent-dark dark:bg-accent-mid hover:bg-accent-light mr-2 rounded-md p-3 font-bold text-white">
        Save
      </button>
      <a href="#" class="font-base ml-2 p-3" @click.prevent="emits(`cancelled`)">
        Cancel
      </a>
    </div>
  </form>
</template>

<script setup lang="ts">
import { type Taxonomy } from '~/layers/mongo/types/taxonomy'

const props = defineProps<{
  uri: string
  term?: Taxonomy
}>()

const emits = defineEmits<{
  created: [taxonomy: Taxonomy],
  updated: [taxonomy: Taxonomy],
  cancelled: [],
}>()

const label = ref(props.term?.label ?? ``)
const parent = ref(props.term?.parent ?? ``)
const { data: terms, refresh } = await useFetch(props.uri, { transform: (data: { items: Taxonomy[] }) => data.items, default: () => [] as Taxonomy[] })

watch(() => props.term, (term) => {
  label.value = term?.label ?? ``
  parent.value = term?.parent ?? ``
})

const submit = async function () {
  const uri = !props.term ? props.uri : props.term.self
  const { data: term } = await useFetch<Taxonomy>(uri, {
    method: !props.term ? `POST` : `PUT`,
    body: {
      label: label.value,
      parent: parent.value,
    },
  })

  if (term.value && !props.term) {
    emits(`created`, term.value)
    refresh()
  } else if (term.value) {
    emits(`updated`, term.value)
  }
}
</script>
