<template>
  <form class="flex h-full flex-col" @submit.prevent="onSubmit">
    <div ref="browser" class="border-primary-60/20 flex h-full w-full flex-col overflow-y-scroll border p-2" @scroll="onScroll">
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10">
        <Thumbnail v-for="(uri, self) of selection" :id="self" :key="self" :src="uri" :selected="true" />
        <Thumbnail v-for="(uri, self) of options" :id="self" :key="self" :src="uri" />
      </div>
    </div>
    <div class="text-primary-40 space-y-2">
      <div class="relative">
        <TwInputFileDrop :max-file-size="maxFileSize" :max-total-file-size="maxTotalFileSize" :max-files="maxFiles" @drop="onFilesDropped" @error="onFileError" />
        <div v-if="uploading" class="bg-base/80 absolute left-0 top-0 flex h-full w-full items-center justify-center">
          <PvProgressSpinner class="h-9 w-9" stroke-width="8" />
        </div>
      </div>
      <div v-if="!error && maxFiles !== undefined" class="flex flex-col">
        <span>Upload up to {{ maxFiles }} images</span>
        <span v-if="maxTotalFileSize">Max. size: {{ maxTotalFileSize / 1024 / 1024 }} MB</span>
        <span v-if="maxFileSize">Max. size/image: {{ maxFileSize / 1024 / 1024 }} MB</span>
      </div>
      <div v-else-if="error" class="bg-red-light group rounded-lg px-3 py-2 text-base">
        <div class="flex flex-row justify-between">
          <span>{{ error }}</span>
          <button class="button button-sm button-red-dark hover:button-red" @click.prevent.stop="error = undefined">
            Dismiss
          </button>
        </div>
      </div>
    </div>
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
import { IconCheck, TwLightbox } from '#components'

const Thumbnail = (props: { id: string, src: string, selected?: boolean }) => {
  const { src, selected } = props
  const url = `${src}?w=150&h=150`
  return (<div class="bg-primary w-full p-0">
    <div class="group relative aspect-square w-full cursor-pointer overflow-hidden">
      <img src={url} class={`${`absolute left-0 top-0 h-full w-full rounded-md object-cover`} ${selected ? `group-hover:opacity-15 opacity-25` : ``}`} onClick={() => onClickThumbnail(props.id, src, selected ?? false)} />
      <button onClick={() => onSelect(props.id, src)}>
        <IconCheck class={`fill-accent-mid stroke-1.5 absolute right-3 top-3 h-9 w-9 stroke-current${!selected ? ` invisible opacity-50 hover:opacity-100 group-hover:visible` : ``}`} />
      </button>
    </div>
  </div>)
}

const props = defineProps<{
  selection?: Record<string, string>
  maxFiles?: number
  maxFileSize?: number
  maxTotalFileSize?: number
}>()

const { stackContent, unstackContent } = useModal()
function onClickThumbnail(id: string, src: string, selected: boolean) {
  stackContent(
    <TwLightbox
      src={src}
      selected={selected}
      onSelect={() => {
        onSelect(id, src)
        unstackContent()
      }}
      onUnselect={() => {
        onSelect(id, src)
        unstackContent()
      }}
      onCancel={unstackContent} />)
}

const { list, entities: images, query: { page, pageSize } } = await fetchEntityList<Image>(`File`, {
  filter: [[`type`, FilterOperator.EQUALS, `image`]],
  select: [`uri`],
  pageSize: 100,
})

const browser = ref<HTMLElement>()
const allLoaded = computed(() => !list.value || page.value * pageSize.value >= list.value.total)
const uploading = ref(false)

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
const error = ref<string>()

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

function onFilesDropped(files: File[]) {
  const { createToast } = useToasts()
  const { data, error, pending } = useFileUpload<Image>(files)
  uploading.value = true
  watch(pending, () => {
    uploading.value = false
    if (data.value) {
      const { entities, total } = data.value
      // FIX: Select all images, not only the first page
      entities.forEach(({ self, uri }) => {
        onSelect(self, uri)
      })
      browser.value!.scrollTop = 0
      createToast(`uploaded-success`, () => `Uploaded ${pluralize(total, `image`, `images`)}`, { type: `success`, duration: 4000 })
    } else if (error.value) {
      createToast(`uploaded-error`, () => error.value, { type: `error` })
    }
  }, { once: true })
}

function onFileError(msg: string, file?: File) {
  error.value = (file && `${file?.name}: ${msg}`) || msg
}

function onSubmit() {
  emits(`select`, selection)
}

function onCancel() {
  emits(`cancel`)
}
</script>
