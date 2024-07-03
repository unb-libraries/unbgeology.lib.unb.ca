<template>
  <form @submit.prevent="onSubmit">
    <div class="grid h-64 grid-cols-8 gap-2 overflow-y-scroll" @scroll="onScroll">
      <Thumbnail v-for="(uri, self) of selection" :key="self" :src="uri" :selected="true" @click="onSelect(self, uri)" />
      <Thumbnail v-for="(uri, self) of options" :key="self" :src="uri" @click="onSelect(self, uri)" />
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
import { IconCheck } from '#components'

const Thumbnail = (props: { src: string, selected?: boolean }) => {
  const { src, selected } = props
  const url = `${src}?w=120&h=120`
  return <div class="bg-primary w-fit p-0">
    <div class="group relative h-24 w-24 cursor-pointer overflow-hidden">
      <img src={url} class={`${`absolute left-0 top-0 h-full w-full rounded-md object-cover`} ${selected ? `group-hover:opacity-15 opacity-25` : ``}`} />
      {selected && <IconCheck class="fill-accent-mid stroke-1.5 absolute right-3 top-3 h-9 w-9 stroke-current group-hover:hidden" />}
      {selected && <div class="absolute right-3 top-3 hidden h-9 w-9 rounded-full border border-dashed group-hover:flex" />}
    </div>
  </div>
}

const props = defineProps<{
  selection?: Record<string, string>
  maxFiles?: number
  maxFileSize?: number
  maxTotalFileSize?: number
}>()

const { list, entities: images, query: { page, pageSize } } = await fetchEntityList<Image>(`File`, {
  filter: [[`type`, FilterOperator.EQUALS, `image`]],
  select: [`uri`],
  pageSize: 100,
})

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
      createToast(`uploaded-success`, () => `Uploaded ${total} images`, { type: `success`, duration: 4000 })
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
