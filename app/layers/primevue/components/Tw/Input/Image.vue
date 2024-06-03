<template>
  <div :id="id" :name="name" :class="classList">
    <div v-if="images && Object.keys(images).length > 0" class="flex flex-row space-x-2">
      <div v-for="(uri, self) of images" :key="self" class="group relative">
        <div class=" relative h-20 w-20 overflow-hidden">
          <img
            :src="uri"
            width="75"
            height="75"
            class="absolute left-0 top-0 h-full w-full rounded-md object-cover"
          >
        </div>
        <IconCancel class="fill-primary-80 hover:fill-red stroke-1.5 absolute -right-2 -top-2 hidden h-6 w-6 cursor-pointer stroke-current group-hover:flex" @click.stop.prevent="delete images![self]" />
      </div>
      <button class="button button-lg button-outline-primary-60 hover:button-outline-accent-mid bg-primary aspect-square w-20 items-center justify-center" @click.stop.prevent="onClickBrowse">
        <IconImages class="h-8 w-8 fill-none stroke-current" />
        <span class="sr-only">
          Browse more images
        </span>
      </button>
    </div>
    <button v-else class="button button-outline-primary-60 hover:button-outline-accent-mid button-lg bg-primary flex w-full flex-col space-y-2 border-dashed p-8" @click.stop.prevent="onClickBrowse">
      <IconImages class="h-12 w-12 fill-none stroke-current" />
      <span>
        Browse images
      </span>
    </button>
  </div>
</template>

<script setup lang="tsx">
import { TwImageBrowser } from '#components'

const images = defineModel<Record<string, string> | undefined>()
const props = defineProps<{
  options: Record<string, string>
  imgClass?: string
  resetActionClass?: string
  placeholder?: string
}>()

const emits = defineEmits<{
  drop: [images: File[]]
}>()

const parentAttrs = inject<Partial<{ id: string, name: string }>>(`attrs`)
const { id = parentAttrs?.id, name = parentAttrs?.name, class: classList } = useAttrs() as { id: string, name: string, class: string }

const { setContent, close: closeModal } = useModal()
const onClickBrowse = () => {
  setContent(() => <TwImageBrowser selection={images.value} options={props.options} onSelect={onSelect} onCancel={closeModal} onDrop={files => emits(`drop`, files)} />)
}

const onSelect = (selection: Record<string, string>) => {
  images.value = selection
  closeModal()
}
</script>
