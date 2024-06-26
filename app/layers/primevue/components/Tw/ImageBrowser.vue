<template>
  <form @submit.prevent="onSubmit">
    <div class="grid h-64 grid-cols-8 gap-2 overflow-y-scroll" @scroll="onScroll">
      <Thumbnail v-for="(uri, self) of selection" :key="self" :src="uri" :selected="true" @click="onSelect(self, uri)" />
      <Thumbnail v-for="(uri, self) of options" :key="self" :src="uri" @click="onSelect(self, uri)" />
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

<script setup lang="tsx">
import { type Image, FilterOperator } from '@unb-libraries/nuxt-layer-entity'
import { IconCheck } from '#components'

const Thumbnail = (props: { src: string, selected?: boolean }) => {
  const { src, selected } = props
  return <div class="bg-primary w-fit p-0">
    <div class="group relative h-24 w-24 cursor-pointer overflow-hidden">
      <img src={src} width={150} height={150} class={`${`absolute left-0 top-0 h-full w-full rounded-md object-cover`} ${selected ? `group-hover:opacity-15 opacity-25` : ``}`} />
      {selected && <IconCheck class="fill-accent-mid stroke-1.5 absolute right-3 top-3 h-9 w-9 stroke-current group-hover:hidden" />}
      {selected && <div class="absolute right-3 top-3 hidden h-9 w-9 rounded-full border border-dashed group-hover:flex" />}
    </div>
  </div>
}

const props = defineProps<{
  selection?: Record<string, string>
}>()

const { list, entities: images, query: { page, pageSize } } = await fetchEntityList<Image>(`File`, {
  filter: [[`type`, FilterOperator.EQUALS, `image`]],
  select: [`uri`],
  pageSize: 100,
})

const allLoaded = computed(() => !list.value || page.value * pageSize.value >= list.value.total)

const allImages = ref([] as Image[])
watch(images, (images) => {
  allImages.value = [...allImages.value, ...images]
}, { immediate: true })

function onScroll(event: Event) {
  const target = event.target as HTMLElement
  if (!allLoaded.value && target.scrollHeight - target.scrollTop === target.clientHeight) {
    page.value++
  }
}

const emits = defineEmits<{
  select: [uris: Record<string, string>]
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

const options = computed<Record<string, string>>(() => {
  return allImages.value
    .filter(({ self }) => !Object.keys(selection).includes(self))
    .map(({ self, uri }) => ({ [self]: uri }))
    .reduce((acc, cur) => ({ ...acc, ...cur }), {})
})

async function onFilesDropped(files: File[]) {
  const uploaded = files.length > 1
    ? await useFileUpload<Image>(files)
    : await useFileUpload<Image>(files[0])
  uploaded.value.forEach(({ self, uri }) => {
    onSelect(self, uri)
  })
}

function onSubmit() {
  emits(`select`, selection)
}

function onCancel() {
  emits(`cancel`)
}
</script>
