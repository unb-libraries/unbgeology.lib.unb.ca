export interface Permission {
  action: string | string[]
  resource: string
  fields?: string[]
}