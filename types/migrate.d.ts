export interface SourceItem {
  id: number
  [s: string]: any
}

export type EntityMatcher<E extends Entity = Entity> = (entity: EntityJSON<E>) => boolean
export type EntityLookup = <E extends Entity = Entity>(matcher: EntityMatcher<E>, entityType?: string) => Promise<string | null>
export type SourceIDLookup = (sourceID: number, entityType?: string) => Promise<string>
export interface LookupHandlers {
  sourceID: SourceIDLookup
  entity: EntityLookup
}
