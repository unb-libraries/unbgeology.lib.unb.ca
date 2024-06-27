<template>
  <EntityForm @save="$emit(`save`, items)" @cancel="$emit(`cancel`)">
    <TwFormField label="Source data">
      <div class="space-y-2">
        <TwInputFileDrop @drop="onDrop" />
        <div v-if="items.length" class="bg-primary-80/40 group rounded-lg px-3 py-2">
          <div class="flex flex-row justify-between">
            <div>{{ items.length }} items</div>
            <button class="button button-sm button-primary-60 invisible group-hover:visible" @click.stop.prevent="onResetItems">
              Reset
            </button>
          </div>
        </div>
      </div>
    </TwFormField>
  </EntityForm>
</template>

<script setup lang="ts">
import { type MigrationItem } from "@unb-libraries/nuxt-layer-entity"
import { parse } from "csv-parse/browser/esm"

defineEmits<{
  save: [items: Pick<MigrationItem, `sourceID` | `data`>[]]
  cancel: []
}>()

const items = ref<Pick<MigrationItem, `sourceID` | `data`>[]>([])
const { createToast } = useToasts()

async function onDrop(files: File[]) {
  const parsed = await Promise.all(files.map(async (f) => {
    switch (f.type) {
      case `text/csv`:
        return parseCsv(await f.text())
      case `application/json`:
        return parseJson(await f.text())
      default: createToast(`unsupported-file-error-${f.type}`, () => `Unsupported file type: ${f.type}`, { type: `error`, duration: 4000 })
    }
  }))

  const migrationItems = parsed.filter(f => f).map(f => f!.map<Pick<MigrationItem, `sourceID` | `data`>>((p) => {
    const data = Object.entries(p)
    const [[, sourceID]] = data
    return { id: `${sourceID}`, data: Object.fromEntries(data) }
  })).flat()

  items.value = Object.values([...items.value, ...migrationItems]
    .map<[string, any]>(item => [item.id, item])
    .reduceRight((items, [id, item]) => ({ ...items, [id]: { ...item, data: { ...items[id]?.data ?? {}, ...item.data } } }), {}))
}

function parseCsv(csv: string) {
  return new Promise<object[]>((resolve) => {
    parse(csv, {}, (err, [header, ...rows]: string[][]) => {
      if (!err) {
        resolve(rows.map(row => Object.fromEntries(row.map((col, i) => [header[i], col]))))
      } else {
        resolve([])
      }
    })
  })
}

function parseJson(json: string) {
  return new Promise<object[]>((resolve) => {
    const parsed = JSON.parse(json)
    if (Array.isArray(parsed)) {
      resolve(parsed)
    } else {
      resolve([parsed])
    }
  })
}

function onResetItems() {
  items.value = []
}
</script>
