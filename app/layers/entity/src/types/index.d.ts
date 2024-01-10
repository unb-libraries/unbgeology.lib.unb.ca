import { type AppConfigInput, type AppConfig } from "nuxt/schema";
import { type Ref, type ComputedRef } from "vue";
export interface Entity {
    readonly id: string;
    readonly created: string;
    readonly updated: string;
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
export interface EntityJSONReference {
    readonly self: string;
    readonly id: string;
}
export type EntityJSONPropertyValue = string | number | boolean | EntityJSONReference;
export type EntityJSON<E extends Entity = Entity> = {
    [P in keyof E]: E[P] extends Entity[] ? EntityJSON<E[P][number]>[] : E[P] extends Entity[] | undefined ? EntityJSON<E[P][number]>[] | undefined : E[P] extends Entity ? EntityJSON<E[P]> : E[P] extends Entity | undefined ? EntityJSON<E[P]> | undefined : E[P];
} & EntityJSONReference;
export type EntityJSONProperties<E extends Entity = Entity, P extends keyof Omit<E, keyof Entity> = keyof Omit<E, keyof Entity>> = Pick<EntityJSON<E>, P>;
export interface EntityJSONList<E extends Entity = Entity> {
    entities: EntityJSON<E>[];
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
export type EntityJSONBodyPropertyValue = Exclude<EntityJSONPropertyValue, EntityJSONReference>;
export type EntityJSONBody<E extends object = object, P extends keyof Omit<E, keyof Entity> = keyof Omit<E, keyof Entity>> = {
    [K in P]: E[K] extends Entity[] ? string[] : E[K] extends Entity[] | undefined ? string[] | undefined : E[K] extends Entity ? string : E[K] extends Entity | undefined ? string | undefined : E[K] extends object ? EntityJSONBody<E[K]> : E[K] extends object | undefined ? EntityJSONBody<E[K]> | undefined : E[K];
};
export type EntityJSONCreateBody<E extends Entity = Entity> = Omit<EntityJSONBody<E>, `self`>;
export type EntityJSONUpdateBody<E extends Entity = Entity> = EntityJSONBody<E> & {
    [K in `self`]-?: EntityJSONBody<E>[K];
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
export interface EntityDeleteResponse {
    success: boolean;
    errors: any[];
}
export interface EntityListResponse<E extends Entity = Entity> {
    list: Ref<EntityJSONList<E> | null>;
    entities: ComputedRef<EntityJSONList<E>[`entities`]>;
    refresh: () => void;
    add: (entity: EntityJSONCreateBody<E>) => Promise<EntityCreateResponse<E>>;
    update: (entity: EntityJSONBody<E>) => Promise<EntityResponse<E>>;
    remove: (entity: EntityJSON) => Promise<EntityDeleteResponse>;
    errors: any[];
}
export interface User extends Entity {
    username: string;
    profile: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
}
export type JUser = EntityJSON<User>;
export type JUserList = EntityJSONList<User>;
export interface Term extends EntityBundle {
    label: string;
}
export type JTerm = EntityJSON<Term>;
export type JTermList = EntityJSONList<Term>;
export interface TaxonomyTerm extends Term {
    parent?: TaxonomyTerm;
}
export type JTaxonomy = EntityJSON<TaxonomyTerm>;
export type JTaxonomyList = EntityJSONList<TaxonomyTerm>;
export interface File extends EntityBundle {
    filename: string;
    filepath: string;
    filesize: number;
    filetype: string;
    persisted: boolean;
    uploadName: string;
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
    INITIAL = 1,
    IDLE = 2,
    PENDING = 4,
    RUNNING = 8,
    IMPORTED = 16,
    ERRORED = 32,
    SKIPPED = 64
}
export interface Migration extends Entity {
    name: string;
    entityType: keyof AppConfig[`entityTypes`];
    source: File;
    total: number;
    imported: number;
    skipped: number;
    errored: number;
    status: MigrationStatus.IDLE | MigrationStatus.RUNNING;
}
export type JMigration = EntityJSON<Migration>;
export type JMigrationList = EntityJSONList<Migration>;
export interface MigrationItem extends Entity {
    sourceID: number;
    data: any;
    entityURI?: string;
    migration: Migration;
    requires: MigrationItem[];
    error?: string;
    status: MigrationStatus.INITIAL | MigrationStatus.PENDING | MigrationStatus.IMPORTED | MigrationStatus.SKIPPED | MigrationStatus.ERRORED;
}
