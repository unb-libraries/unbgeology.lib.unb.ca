<template>
  <form @submit.prevent="onSubmit">
    <div class="grid grid-cols-8 gap-2">
      <div v-for="(uri, self) of options" :key="self" class="bg-primary w-fit p-0">
        <div class="group relative h-24 w-24 cursor-pointer overflow-hidden">
          <img
            :src="uri"
            width="150"
            height="150"
            class="absolute left-0 top-0 h-full w-full rounded-md object-cover"
            :class="{ 'group-hover:opacity-15 opacity-25': selection[self] !== undefined }"
            @load="onLoad"
            @click="onSelect(self, uri)"
          >
          <IconCheck v-if="selection[self]" class="fill-accent-mid stroke-1.5 absolute right-3 top-3 h-9 w-9 stroke-current group-hover:hidden" />
          <div v-if="selection[self]" class="absolute right-3 top-3 hidden h-9 w-9 rounded-full border border-dashed group-hover:flex" />
        </div>
      </div>
    </div>
    <TwInputFileDrop @drop="onFilesDropped" />
    <div class="flex flex-row space-x-2">
      <button type="submit" class="button-accent-mid hover:button-accent-light button-lg">
        Select
      </button>
      <a class="button-lg button-transparent cursor-pointer hover:underline" @click.stop.prevent="onCancel">Cancel</a>
    </div>
  </form>
</template>

<script setup lang="ts">
const props = defineProps<{
  selection?: Record<string, string>
  options: Record<string, string>
}>()

function onLoad() {

}

const emits = defineEmits<{
  select: [uris: Record<string, string>]
  drop: [files: File[], select?:(id: string, uri: string) => void]
  cancel: []
}>()

const selection = reactive<Record<string, string>>({ ...(props.selection ?? {}) })
function onSelect(id: string, uri: string) {
  if (!selection[id]) {
    selection[id] = uri
  } else {
    delete selection[id]
  }
}

function onFilesDropped(files: File[]) {
  emits(`drop`, files)
}

function onSubmit() {
  emits(`select`, selection)
}

function onCancel() {
  emits(`cancel`)
}
</script>
