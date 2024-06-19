<template>
  <EntityForm :entity="entity" @save="onSave" @cancel="$emit(`cancel`)">
    <TwFormField label="Name">
      <PvInputText id="form-input-label" v-model="name" class="input input-text-lg" />
    </TwFormField>
    <TwFormField label="Entity type">
      <PvInputDropdown
        v-model="entityType"
        class="input-select-lg"
        :options="entityTypeOptions ?? []"
      />
    </TwFormField>
    <TwFormField label="Dependencies">
      <PvInputDropdown
        v-model="dependencies"
        class="input-select-lg"
        :multi="true"
        :options="migrations"
        option-field="self"
        label-field="name"
      />
    </TwFormField>
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

<script setup lang="tsx">
import { type MigrationItem, type EntityJSON, type EntityJSONProperties, type Migration } from "@unb-libraries/nuxt-layer-entity"
import { parse } from "csv-parse/browser/esm"

const props = defineProps<{
  entity?: EntityJSONProperties<Migration> & Partial<EntityJSON<Migration>>
  entityTypeOptions?: [string, string][]
}>()

const emits = defineEmits<{
  save: [migration: Pick<Migration, `name` | `entityType` | `dependencies`>, items?: Pick<MigrationItem, `id` | `data`>[]]
  cancel: []
}>()

const { entities: migrations } = await fetchEntityList(`Migration`)
const name = ref<string>(props.entity?.name ?? ``)
const entityType = ref<string>(props.entity?.entityType ?? ``)
const dependencies = ref<string[]>(props.entity?.dependencies?.map(d => d.self) ?? [])
const items = ref<Pick<MigrationItem, `sourceID` | `data`>[]>([])
const { createToast } = useToasts()

function onSave() {
  emits(`save`, {
    name: name.value,
    entityType: entityType.value,
    dependencies: dependencies.value,
  }, items.value)
}

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
