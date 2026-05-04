<template>
  <EntityForm
    @save="$emit(`save`, items)"
    @cancel="$emit(`cancel`)"
  >
    <TwFormField label="Source data">
      <div class="space-y-2">
        <InputMigrationItemFileDrop
          @drop="onDropItems"
          @error="onError"
        />
        <div
          v-if="items.length"
          class="bg-primary-80/40 group rounded-lg px-3 py-2"
        >
          <div class="flex flex-row justify-between">
            <div>{{ items.length }} items</div>
            <button
              class="button button-sm button-primary-60 invisible group-hover:visible"
              @click.stop.prevent="items = []"
            >
              Reset
            </button>
          </div>
        </div>
        <div
          v-else-if="error"
          class="bg-red-light group rounded-lg px-3 py-2 text-base"
        >
          <div class="flex flex-row justify-between">
            <span>{{ error }}</span>
            <button
              class="button button-sm button-red-dark hover:button-red"
              @click.prevent.stop="error = undefined"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </TwFormField>
  </EntityForm>
</template>

<script setup lang="ts">
import type { MigrationItem } from "@unb-libraries/nuxt-layer-entity"

defineEmits<{
  save: [items: Pick<MigrationItem, `sourceID` | `data`>[]]
  cancel: []
}>()

const items = ref<Pick<MigrationItem, `sourceID` | `data`>[]>([])
const error = ref()

function onDropItems(dropped: Pick<MigrationItem, `sourceID` | `data`>[]) {
  items.value = [...items.value, ...dropped]
}

function onError(msg: string) {
  error.value = msg
}
</script>
