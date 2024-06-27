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
        <div v-else-if="error" class="bg-red-light group rounded-lg px-3 py-2 text-base">
          <div class="flex flex-row justify-between">
            <span>{{ error }}</span>
            <button class="button button-sm button-red-dark hover:button-red" @click.prevent.stop="error = undefined">
              Dismiss
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
const error = ref()

async function onDrop(files: File[]) {
  error.value = undefined
  const parsed = await Promise.all(files.map(async (f) => {
    try {
      switch (f.type) {
        case `text/csv`:
          return await parseCsv(await f.text())
        case `application/json`:
          return await parseJson(await f.text())
        default: error.value = `Unsupported file type: ${f.type}`
      }
    } catch (err: unknown) {
      error.value = (err as Error).message
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
  return new Promise<object[]>((resolve, reject) => {
    parse(csv, {}, (err, content: string[][]) => {
      if (!content) {
        return reject(new Error(`Parse error: invalid CSV`))
      }
      const [header, ...rows] = content
      if (!err) {
        resolve(rows.map(row => Object.fromEntries(row.map((col, i) => [header[i], col]))))
      } else {
        reject(new Error(err.message))
      }
    })
  })
}

function parseJson(json: string) {
  return new Promise<object[]>((resolve, reject) => {
    try {
      const parsed = JSON.parse(json)
      if (Array.isArray(parsed)) {
        resolve(parsed)
      } else {
        resolve([parsed])
      }
    } catch (err: unknown) {
      reject(err)
    }
  })
}

function onResetItems() {
  items.value = []
}
</script>
