<template>
  <div :id="id" :name="name" :class="classList">
    <div v-if="images && Object.keys(images).length > 0" class="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10">
      <div v-for="(uri, self) of images" :key="self" class="group relative">
        <div class=" relative aspect-square w-full overflow-hidden">
          <img
            :src="`${uri}?w=150&h=150`"
            class="absolute left-0 top-0 h-full w-full rounded-md object-cover"
          >
        </div>
        <IconCancel class="fill-primary-80 hover:fill-red stroke-1.5 absolute -right-2 -top-2 hidden h-6 w-6 cursor-pointer stroke-current group-hover:flex" @click.stop.prevent="delete images![self]" />
      </div>
      <button class="button button-lg button-outline-primary-60 hover:button-outline-accent-light hover:bg-primary bg-primary aspect-square w-full items-center justify-center" @click.stop.prevent="onClickBrowse">
        <IconImages class="h-2/3 w-2/3 fill-none stroke-current" />
        <span class="sr-only">
          Browse more images
        </span>
      </button>
    </div>
    <button v-else class="button button-outline-primary-60 hover:button-outline-accent-light button-lg hover:bg-primary bg-primary flex w-full flex-col space-y-2 border-dashed p-8" @click.stop.prevent="onClickBrowse">
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
  imgClass?: string
  resetActionClass?: string
  placeholder?: string
  maxFileSize?: number
  maxTotalFileSize?: number
  maxFiles?: number
}>()

const parentAttrs = inject<Partial<{ id: string, name: string }>>(`attrs`)
const { id = parentAttrs?.id, name = parentAttrs?.name, class: classList } = useAttrs() as { id: string, name: string, class: string }

const { stackContent, unstackContent } = useModal()
const onClickBrowse = () => {
  stackContent(
    <TwImageBrowser
      selection={images.value}
      maxFileSize={props.maxFileSize}
      maxTotalFileSize={props.maxTotalFileSize}
      maxFiles={props.maxFiles}
      class={`sm:min-w-[480px] md:min-w-[560px] lg:min-w-[720px] xl:min-w-[960px] 2xl:min-w-[1080px]`}
      onSelect={onSelect}
      onCancel={unstackContent}
    />)
}

const onSelect = (selection: Record<string, string>) => {
  images.value = selection
  unstackContent()
}
</script>
