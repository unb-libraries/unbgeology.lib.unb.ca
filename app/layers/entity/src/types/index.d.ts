import { type AppConfigInput } from "nuxt/schema";
import { type Ref, type ComputedRef } from "vue";
export declare enum Status {
}
export interface Stateful<T extends typeof Status> {
    status: keyof T extends string ? Lowercase<keyof T> | T[keyof T] : T[keyof T];
}
export interface Entity {
    readonly self: string;
    readonly id: string;
    readonly created: string;
    readonly updated: string;
}
export interface Slugified {
    slug: string;
}
export interface EntityBundle extends Entity {
    type: string;
}
export interface EntityType<E extends Entity = Entity> {
    name: string;
    abstract?: boolean;
    baseURI: string;
    uri: (entity: E) => string;
    extends?: keyof AppConfigInput[`entityTypes`];
}
export type EntityJSON<E extends Entity = Entity, K extends keyof E | undefined = undefined> = Pick<E, K extends undefined ? keyof Omit<E, `id` | `self`> : K> & Pick<E, `id` | `self`>;
export type EntityJSONPropertyValue = string | number | boolean | EntityJSON;
export type EntityJSONProperties<E extends Entity = Entity, P extends keyof Omit<E, keyof Entity> = keyof Omit<E, keyof Entity>> = Pick<EntityJSON<E>, P>;
export interface EntityJSONList<E extends EntityJSON = EntityJSON> {
    entities: E[];
    nav: {
        first?: string;
        last?: string;
        next?: string;
        prev?: string;
    };
    page: number;
    pageSize: number;
    self: string;
    total: number;
}
export type EntityJSONBodyPropertyValue = Exclude<EntityJSONPropertyValue, EntityJSON>;
export type EntityJSONBody<E extends object = object, P extends keyof Omit<E, keyof Entity> = keyof Omit<E, keyof Entity>> = {
    [K in P]: E[K] extends Entity[] ? string[] : E[K] extends Entity[] | undefined ? string[] | undefined : E[K] extends Entity ? string : E[K] extends Entity | undefined ? string | undefined : E[K] extends object ? EntityJSONBody<E[K]> : E[K] extends object | undefined ? EntityJSONBody<E[K]> | undefined : E[K];
};
export type EntityJSONCreateBody<E extends Entity = Entity> = Omit<EntityJSONBody<E>, `self`>;
export type EntityJSONUpdateBody<E extends Entity = Entity> = EntityJSONBody<E> & {
    [K in `self`]-?: EntityJSONBody<E[K]>;
};
export interface EntityResponse<E extends Entity = Entity> {
    entity: Ref<EntityJSON<E> | null>;
    errors: any[];
}
export interface EntityFetchResponse<E extends Entity = Entity> extends EntityResponse<E> {
    update: () => Promise<void>;
    remove: () => Promise<void>;
}
export type EntityCreateResponse<E extends Entity = Entity> = EntityFetchResponse<E>;
export type EntityUpdate<E extends Entity = Entity> = Partial<Omit<E, `self` | `id`>> & Pick<Entity, `self` | `id`> & {
    previous: Omit<EntityUpdate<E>, `previous`>;
};
export type EntityDiff<E extends Entity = Entity> = [Omit<EntityUpdate<E>, `previous`>, Omit<EntityUpdate<E>, `previous`>];
export type EntityUpdateList<E extends Entity = Entity> = EntityJSONList<EntityUpdate<E>>;
export interface EntityDeleteResponse {
    success: boolean;
    errors: any[];
}
export declare enum FilterOperator {
    EQUALS = 1,
    MATCH = 2,
    GREATER = 4,
    LESS = 8,
    NOT = 16,
    AND = 32,
    OR = 64
}
export type Filter = [string, FilterOperator, string] | [string, FilterOperator];
export interface Transformer<V = any> {
    input: (filterValue: string[]) => V;
    output: (value: V) => (string[] | undefined);
    empty: (value: V) => boolean;
}
export interface FilterGroup {
    has: (id: string, op?: FilterOperator, value?: string) => boolean;
    get: (id: string, op?: FilterOperator) => Map<FilterOperator, Set<string>> | Set<string> | undefined;
    set: (id: string, op: FilterOperator, value: Set<string>) => void;
    add: (id: string, op?: FilterOperator, value?: string) => void;
    remove: (id: string, op?: FilterOperator, value?: string) => void;
    toArray: () => Filter[];
}
export interface FetchEntityListOptions {
    filter?: Filter[];
    page?: number;
    pageSize?: number;
    search?: string;
    sort?: string[];
    select?: string[];
}
export interface EntityListResponse<E extends Entity = Entity> {
    list: Ref<EntityJSONList<E> | null>;
    entities: ComputedRef<EntityJSONList<E>[`entities`]>;
    query: {
        filter: Ref<Filter[]>;
        page: Ref<number>;
        pageSize: Ref<number>;
        search: Ref<string>;
        select: Ref<string[]>;
        sort: Ref<string[]>;
    };
    refresh: () => void;
    add: (entity: EntityJSONCreateBody<E>) => Promise<EntityCreateResponse<E>>;
    update: (entity: EntityJSONBody<E>) => Promise<EntityResponse<E>>;
    remove: (entity: EntityJSON) => Promise<EntityDeleteResponse>;
    errors: any[];
}
export interface Permission {
    action: string | string[];
    resource: string;
    fields?: string[];
}
export interface User extends Entity {
    username: string;
    active: boolean;
    profile: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
}
export type JUser = EntityJSON<User>;
export type JUserList = EntityJSONList<User>;
export interface Term extends EntityBundle, Slugified {
    label: string;
}
export type JTerm = EntityJSON<Term>;
export type JTermList = EntityJSONList<Term>;
export interface TaxonomyTerm extends Term {
    parent?: TaxonomyTerm;
}
export type JTaxonomy = EntityJSON<TaxonomyTerm>;
export type JTaxonomyList = EntityJSONList<TaxonomyTerm>;
export declare enum FileState {
    PENDING = 1,
    PERSISTED = 2,
    DELETED = 4
}
export interface File extends Stateful<typeof FileState>, EntityBundle {
    filename: string;
    filesize: number;
    mimetype: string;
    uri: string;
}
export type JFile = EntityJSON<File>;
export type JFileList = EntityJSONList<File>;
export interface Image extends File {
    alt: string;
    dimensions: {
        width: number;
        height: number;
    };
    title: string;
}
export type JImage = EntityJSON<Image>;
export type JImageList = EntityJSONList<Image>;
export interface Document extends File {
}
export type JDocument = EntityJSON<Document>;
export type JDocumentList = EntityJSONList<Document>;
export declare enum MigrationStatus {
    IDLE = 1,
    RUNNING = 2
}
export interface Migration extends Stateful<typeof MigrationStatus>, Entity {
    name: string;
    entityType: string;
    dependencies: Migration[];
    total: number;
    imported: number;
    skipped: number;
    errored: number;
}
export type JMigration = EntityJSON<Migration>;
export type JMigrationList = EntityJSONList<Migration>;
export declare enum MigrationItemStatus {
    INITIAL = 1,
    QUEUED = 2,
    PENDING = 4,
    IMPORTED = 8,
    ERRORED = 16,
    SKIPPED = 32
}
export interface MigrationItem extends Stateful<typeof MigrationItemStatus>, Entity {
    sourceID: number;
    data: any;
    entityURI?: string;
    migration: Migration;
    error?: string;
}
