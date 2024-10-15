<template>
  <TwInputFileDrop @drop="onDrop" />
</template>

<script lang="ts" setup>
import type { MigrationItem } from "@unb-libraries/nuxt-layer-entity"
import { parse } from "csv-parse/browser/esm"

type Item = { id: string } & Pick<MigrationItem, `data`>

const emits = defineEmits<{
  drop: [items: Item[]]
  error: [msg: string]
  cancel: []
}>()

async function onDrop(files: File[]) {
  const parsed = await Promise.all(files.map(async (f) => {
    try {
      switch (f.type) {
        case `text/csv`:
          return await parseCsv(await f.text())
        case `application/json`:
          return await parseJson(await f.text())
        default: emits(`error`, `Unsupported file type: ${f.type}`)
      }
    } catch (err: unknown) {
      emits(`error`, (err as Error).message)
    }
  }))

  const items = parsed.filter(f => f).map(f => f!.map<Item>((p) => {
    const data = Object.entries(p)
    const [[, sourceID]] = data
    return { id: `${sourceID}`, data: Object.fromEntries(data) }
  })).flat().reduce((all, item) => ({ ...all, [item.id]: { id: item.id, data: { ...all[item.id]?.data ?? {}, ...item.data } } }), {} as Record<string, Item>)

  emits(`drop`, Object.values(items))
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
</script>
