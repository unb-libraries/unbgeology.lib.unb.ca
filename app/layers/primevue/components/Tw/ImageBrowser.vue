<template>
  <form class="flex h-full flex-col" @submit.prevent="onSubmit">
    <div class="flex justify-between">
      <div class="border-primary-60/20 bg-primary-60/20 inline-flex w-fit rounded-md border">
        <div v-for="tab in tabs" :class="[`rounded-l-md px-4 py-1 text-center`, { 'bg-accent-mid rounded-r-md': tab === activeTab, 'hover:cursor-pointer': tab !== activeTab }]" @click.prevent.stop="onChangeTab(tab)">
          {{ tab }}<template v-if="tab === 'Selected'"> ({{ Object.values(selection).length }})</template>
        </div>
      </div>
      <TwPageIndex :page="page" :size="5" :total="Math.ceil((displayedImageList?.total ?? 0) / pageSize)" @change="newPage => page = newPage" />
    </div>
    <div class="relative border-primary-60/20 h-64 w-full grow overflow-y-scroll border p-2">
      <TwImageGallery v-if="displayedImageList.entities?.length" :images="displayedImageList.entities" thumbnail-wrapper-class="group" @click-thumbnail="image => !isSelected(image) && onSelect(image)">
        <template #overlay="{ image }">
          <button class="hidden group-hover:block" @click.prevent.stop="onClickThumbnail(image)">
            <IconMaximize class="bg-primary stroke-1.5 absolute bottom-2 right-2 size-8 rounded-md stroke-current p-1 opacity-50 hover:opacity-100" />
          </button>
          <div v-if="isSelected(image)" class="group/check bg-accent-mid hover:bg-red absolute right-2 top-2 size-8 rounded-md p-1" @click.prevent.stop="onSelect(image)">
            <IconCheck class="h-8-w-8 fill-transparent stroke-current stroke-2 group-hover/check:hidden" />
            <IconCancel class="h-8-w-8 hidden fill-transparent stroke-current stroke-2 hover:cursor-pointer group-hover/check:block" />
          </div>
        </template>
      </TwImageGallery>
      <div v-show="pending" class="absolute bg-primary/70 top-0 left-0 size-full justify-center items-center flex">
        <IconSpinner class="size-12 animate-spin fill-none stroke-current stroke-2" />
      </div>
    </div>
    <TwFileUpload @upload="files => onUpload(files as Image[])" @error="onUploadError" />
    <div class="flex flex-none flex-row space-x-2">
      <button type="submit" class="button-accent-mid hover:button-accent-light button-lg">
        Select
      </button>
      <a class="button-lg button-transparent cursor-pointer hover:underline" @click.stop.prevent="onCancel">Cancel</a>
    </div>
  </form>
</template>

<script setup lang="tsx">
import { type EntityJSONList, type Filter, type Image } from '@unb-libraries/nuxt-layer-entity'
import { IconMaximize, IconCheck, IconCancel, TwLightbox } from '#components'

const props = defineProps<{
  selection?: Image[]
  maxFiles?: number
  maxFileSize?: number
  maxTotalFileSize?: number
  single?: boolean
  filter?: [string, Filter[]][]
}>()

const emits = defineEmits<{
  select: [images: Image[]]
  cancel: []
}>()

const { createToast } = useToasts()
const { stackContent, unstackContent } = useModal()

const page = ref(1)
const pageSize = 100

const tabs = computed(() => [`All`, 'Selected', ...(props.filter?.map(([tab]) => tab) ?? [])])
const activeTab = ref<string>('All')

const selection = reactive<Record<string, Image>>(Object.fromEntries(props.selection?.map(image => [image.self, image]) ?? []))
const filter = computed(() => props.filter?.find(([tab]) => tab === activeTab.value)?.[1]?.join(':'))
const { data: imageList, pending } = await useFetch<EntityJSONList<Image>>(`/api/files/images`, { query: { filter, select: 'uri', sort: '-created', page, pageSize } })
const displayedImageList = computed<EntityJSONList<Image>>(() => {
  if (activeTab.value !== 'Selected') {
    return imageList.value ?? { self: '/api/files/images', entities: [], page: 1, pageSize, total: 0, nav: {} }
  } else {
    const images = Object.values(selection)
    return {
      self: '/api/files/images',
      entities: images.slice((page.value - 1) * pageSize, page.value * pageSize),
      page: page.value,
      pageSize,
      total: images.length,
      nav: {},
    }
  }
})

function onChangeTab(tab: string) {
  activeTab.value = tab
  page.value = 1
}

function isSelected(image: Image) {
  return selection[image.self] !== undefined
}

function onSelect(image: Image) {
  if (!props.single && !selection[image.self]) {
    selection[image.self] = image
  } else if (props.single && !selection[image.self]) {
    Object.keys(selection).forEach(key => delete selection[key])
    selection[image.self] = image
  } else {
    delete selection[image.self]
  }
}

function onUpload(images: Image[]) {
  images.forEach((image) => {
    onSelect(image)
  })
  createToast(`uploaded-success`, () => `Uploaded ${pluralize(images.length, `image`, `images`)}`, { type: `success`, duration: 4000 })
}

function onUploadError(msg: string) {
  createToast(`uploaded-error`, () => msg, { type: `error` })
}

function onClickThumbnail(image: Image) {
  const selected = isSelected(image)
  stackContent(
    <TwLightbox
      src={image.uri}
      selected={selected}
      onSelect={() => {
        onSelect(image)
        unstackContent()
      }}
      onUnselect={() => {
        onSelect(image)
        unstackContent()
      }}
      onCancel={unstackContent}>
      {{
        controls: () =>
          <div>
            <div class={`bg-primary-60 hover:bg-primary-40 absolute right-4 top-4 rounded-md p-1 hover:cursor-pointer`} onClick={withModifiers(() => unstackContent(), [`prevent`, `stop`])}>
              <IconCancel class={`size-9 stroke-current stroke-1`} />
            </div>
            <button
              class={[`button button-lg absolute left-4 top-4`, { 'button-accent-mid hover:button-accent-light': !selected, 'button-red hover:button-red-light': selected }]}
              onClick={withModifiers(() => {
                onSelect(image)
                unstackContent()
              }, [`stop`, `prevent`])}>
              {selected ? `Unselect` : `Select`}
            </button>
          </div>,
      }}
    </TwLightbox>)
}

function onSubmit() {
  emits(`select`, Object.values(selection))
}

function onCancel() {
  emits(`cancel`)
}
</script>
