<template>
  <EntityForm class="h-full" @save="onSave" @cancel="$emit(`cancel`)">
    <TwFormField v-for="(item, i) in history" :key="item[0]" :label="`#${i + 1}`">
      <div class="inline-flex w-full space-x-3">
        <TwFormField label="Location" class="w-2/3" label-class="sr-only">
          <InputStorageLocation v-model="item[1]">
            <template #before>
              <div class="text-primary-40 shrink-0 italic">
                Location:
              </div>
            </template>
          </InputStorageLocation>
        </TwFormField>
        <TwFormField label="Date in" class="w-1/3" label-class="sr-only">
          <TwInputText v-model="item[2]" class="input input-text-lg" placeholder="YYYY-MM-DD">
            <template #before>
              <div class="text-primary-40 shrink-0 italic">
                Date in:
              </div>
            </template>
          </TwInputText>
        </TwFormField>
        <button class="button-red hover:button-red-light button-md disabled:button-primary-40 w-fit shrink-0" :disabled="!canRemove(item)" @click.stop.prevent="onRemove(item[0])">
          <IconCancel class="size-6 fill-none stroke-current stroke-2" />
        </button>
      </div>
    </TwFormField>
  </EntityForm>
</template>

<script setup lang="tsx">
import { type Specimen } from '~/types/specimen'

const props = defineProps<{
  specimen: Specimen
}>()

const emits = defineEmits<{
  save: [specimen: {
    storage: {
      location: string
      dateIn: string
    }[]
  }]
  cancel: []
}>()

const generator = (function* () {
  let id = 1
  while (true) {
    yield id++
  }
})()

function generateID() {
  return `${generator.next().value}`
}

const history = reactive<[string, string | undefined, string | undefined][]>(props.specimen.storage?.map(({ location: { self }, dateIn }) => [generateID(), self, dateIn.substring(0, 10)]) ?? [[generateID(), undefined, undefined]])
const emptyItems = computed(() => history.filter(([, location, date]) => !location && !date).length)

watch(history, () => {
  while (emptyItems.value < 1) {
    history.push([generateID(), undefined, undefined])
  }
  while (emptyItems.value > 1) {
    history
      .filter(([, location, date]) => !(location || date))
      .map(([id]) => id)
      .forEach(onRemove)
  }
}, { immediate: true })

function canRemove([, location, date]: [string, string | undefined, string | undefined]) {
  return emptyItems.value > 1 || location || date
}

function onRemove(id: string) {
  const index = history.findIndex(([i]) => i === id)
  if (index > -1) {
    history.splice(index, 1)
  }
}

function onSave() {
  emits(`save`, {
    storage: (history
      .filter(([, location, date]) => location && date) as [string, string, string][])
      .map(([, location, dateIn]) => ({
        location,
        dateIn,
      })),
  })
}
</script>
