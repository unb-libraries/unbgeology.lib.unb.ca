import { defu } from "defu"
import type { Entity } from "@unb-libraries/nuxt-layer-entity"

export type ASC = 1
export type DESC = -1
export type Sort = ASC | DESC | 0

export interface Field<E extends Entity = Entity> {
  id: keyof E
  entityType: string
  label: string
  toggable: boolean
  selected: boolean
  sort: Sort | false
  permission?: string | string[] | RegExp
}

export type FieldDefinition<E extends Entity = Entity> = Partial<Omit<Field<E>, `id` | `entityType`>>
export type EntitySchema<E extends Entity = Entity> = ReturnType<typeof defineEntitySchema<E>>
export interface EntitySchemaOptions<E extends Entity = Entity> {
  withPermission: boolean
  fieldPermission: (id: keyof E) => string | string[] | RegExp
}

export function defineEntityField<E extends Entity = Entity>(id: keyof E, entityType: string, schema?: FieldDefinition): Field<E> {
  return {
    id,
    entityType,
    label: String(id).substring(0, 1).toUpperCase() + String(id).substring(1).toLowerCase(),
    toggable: true,
    selected: true,
    sort: 0,
    permission: new RegExp(`read:${entityType.toLowerCase()}:(${String(id)}|\\*)`),
    ...schema,
  }
}

export function defineEntitySchema<E extends Entity = Entity>(name: string, schema: Record<keyof E, string | FieldDefinition<E>> | (keyof E | [keyof E, string | FieldDefinition<E>])[], options?: Partial<EntitySchemaOptions<E>>) {
  const { withPermission, fieldPermission } = defu(options ?? {}, { withPermission: true })
  const { hasPermission } = useCurrentUser()

  const arr = (Array.isArray(schema) ? schema : Object.entries(schema))
  const fields = arr
    .map(field => Array.isArray(field)
      ? defineEntityField(String(field[0]) as keyof E, name, typeof field[1] === `string` ? { label: field[1] } : field[1])
      : defineEntityField(String(field) as keyof E, name))
    .map(({ id, permission, ...field }) => ({ id, permission: (fieldPermission && fieldPermission(id)) || permission, ...field }))
    .filter(({ permission }) => !withPermission || (permission && hasPermission(permission)))
  const entries = fields.map<[keyof E, Field<E>]>(field => [field.id, field])

  return {
    schema: Object.fromEntries(entries) as Record<keyof E, Field<E>>,
    keys: fields.map<keyof E>(({ id }) => id as keyof E),
    values: fields,
    entries: entries as [keyof E, Field<E>][],
    map: <T extends Field<E>>(fn: <T>(value: Field<E>, index: number, arr: Field<E>[]) => T) => defineEntitySchema<E>(name, fields
      .map<[keyof E, T]>((field, index, arr) => [field.id as keyof E, fn(field, index, arr)])),
    filter: (predicate: (value: Field<E>, index: number, arr: Field<E>[]) => boolean) => defineEntitySchema<E>(name, fields
      .filter(predicate)
      .map<[keyof E, Field<E>]>(field => [field.id as keyof E, field])),
    forEach: fields.forEach,
  }
}
