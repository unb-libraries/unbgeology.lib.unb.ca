import type { Entity } from "@unb-libraries/nuxt-layer-entity"

export interface Field {
  id: string
  entityType: string
  label: string
  toggable: boolean
  selected: boolean
  sort: 1 | 0 | -1 | false
  permission?: string | string[] | RegExp
}

export type FieldDefinition = Partial<Omit<Field, `id` | `entityType`>>
export type EntitySchema<E extends Entity = Entity> = ReturnType<typeof defineEntitySchema<E>>

export function defineEntityField(id: string, entityType: string, schema?: FieldDefinition): Field {
  return {
    id,
    entityType,
    label: id.substring(0, 1).toUpperCase() + id.substring(1).toLowerCase(),
    toggable: true,
    selected: true,
    sort: 0,
    permission: new RegExp(`read:${entityType.toLowerCase()}:(${id}|\\*)`),
    ...schema,
  }
}

export function defineEntitySchema<E extends Entity = Entity>(name: string, schema: Record<keyof E, string | FieldDefinition> | (keyof E | [keyof E, string | FieldDefinition])[]) {
  const arr = (Array.isArray(schema) ? schema : Object.entries(schema))
  const fields = arr.map(field => Array.isArray(field)
    ? defineEntityField(String(field[0]), name, typeof field[1] === `string` ? { label: field[1] } : field[1])
    : defineEntityField(String(field), name))
  const entries = fields.map<[string, Field]>(field => [field.id, field])
  return {
    schema: Object.fromEntries(entries) as Record<keyof E, Field>,
    keys: fields.map<keyof E>(({ id }) => id as keyof E),
    values: fields,
    entries: entries as [keyof E, Field][],
    map: <T extends Field>(fn: <T>(value: Field, index: number, arr: Field[]) => T) => defineEntitySchema<E>(name, fields
      .map<[keyof E, Field]>((field, index, arr) => [field.id as keyof E, fn<T>(field, index, arr)])),
    filter: (predicate: (value: Field, index: number, arr: Field[]) => boolean) => defineEntitySchema<E>(name, fields
      .filter(predicate)
      .map<[keyof E, Field]>(field => [field.id as keyof E, field])),
    forEach: fields.forEach,
  }
}
