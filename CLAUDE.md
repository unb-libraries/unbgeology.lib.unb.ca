# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Nuxt 4 application for `unbgeology.lib.unb.ca` (UNB Libraries' Earth Science Collections / Quartermain Centre digital catalogue). Package manager is **pnpm** (see `pnpm-workspace.yaml`). Development runs inside Docker; a companion `composer.json` pulls in `dockworker-node` for scaffolding/provisioning the local dev environment (PHP tooling used only for that, not for the app itself).

## Commands

Most day-to-day commands are meant to run **inside the dev container**, not on the host.

```bash
pnpm start                    # docker compose up — brings up the app + SAML IdP containers
pnpm shell                    # shell into the running app container
pnpm container:install <pkg>  # add a dependency inside the container (keeps lockfile in sync)
pnpm container:inspect        # pnpm list inside the container
pnpm container:postinstall    # re-run postinstall inside the container

pnpm dev                      # nuxt dev (only meaningful once inside the container)
pnpm build                    # nuxt build

pnpm lint                     # eslint .
pnpm lint:staged              # eslint --fix on staged *.ts files only

pnpm test                     # unit + e2e
pnpm test:unit                # vitest run -c ./tests/unit/vitest.config.ts
pnpm test:e2e                 # cypress open -C ./tests/e2e/cypress.config.ts
pnpm test:e2e:headless        # cypress run -C ./tests/e2e/cypress.config.ts
```

Run a single unit test file: `pnpm test:unit -- tests/unit/specs/app.nuxt.test.ts` (vitest args pass through after `--`).

There is no `.git` submodule for `layers/entity` — it's a local pnpm-linked package (`@unb-libraries/nuxt-layer-entity`, `link:layers/entity`) that supplies shared **type definitions** only (`layers/entity/src/types`). All runtime behavior for entities lives in this repo's `server/utils/`.

## Architecture

### Nuxt layer

`nuxt.config.ts` extends `./layers/local` (project-specific overrides) and links in `layers/entity` for shared entity/permission TypeScript types (`Entity`, `EntityJSON`, `EntityJSONList`, `Stateful`, `Hierarchical`, `Slugified`, `Permission`, etc.). Path aliases of note: `document-types` → `server/documentTypes`, `vocabularies` → `server/vocabularies`, `types` → `types/`, and Nitro's own `#server/...` alias into `server/`.

### Document/entity model (server/documentTypes, server/utils/schema.ts)

Data is persisted via Mongoose, but schemas are never defined with raw Mongoose `Schema` — they go through a custom builder in `server/utils/schema.ts`:

- `defineDocumentSchema<D>(paths, options)` builds a composable schema fragment. Fragments are combined with `.mixin(otherSchema)`, and each can register an `alterSchema(schema)` hook (e.g. Mongoose `pre('save')` hooks).
- `defineDocumentModel(name, schema, base?)` creates a Mongoose model. When `base` is given, the new model is a **Mongoose discriminator** on the base model, and its `fullName` becomes dotted (`Specimen.Fossil`, `Term.Person`, `Term.Affiliate.Person`, ...). This dotted `type` field is the discriminator key and shows up throughout the codebase (casbin resource paths, `renderX` functions switching on `doc.type`, etc.).
- Every document type composes small **mixins** from `server/utils/mixins/`:
  - `Stateful({ values, default })` — adds a `status` field driven by a numeric/bitflag enum (draft/published/migrated/etc.).
  - `Authorize({ paths })` — computes an `authTags: string[]` on save, used by casbin (see below) to scope permissions to e.g. `term:affiliate:person:draft`.
  - `Slugified`, `Hierarchical`, `IPIKable` — slugging, parent/ancestor trees, and ID-generation respectively (see `server/utils/ypik.ts` / `ipik.ts`).
- Each `server/documentTypes/*.ts` file typically exports: the TS `interface` for the document shape, a `renderX(doc)` function that maps a Mongoose doc to its public JSON API shape, and a default export map of Mongoose models (base + discriminators) built with `defineDocumentModel`.
- Document models are registered onto Nitro's context by numbered middleware files under `server/middleware/**/*.register.ts` (e.g. `server/middleware/terms/30.term.register.ts`, `server/middleware/specimens/70.specimen.register.ts`) — the numeric prefix controls registration order since discriminators must register after their base model.

### Authorization (casbin)

Access control is policy-based via [casbin](https://casbin.org/), configured in `model.conf` (RBAC + resource/field/action matching using `keyMatch2` and a custom `arrayRegexMatch` for the `authTags` scoping) and `policy.csv` (role → resource → fields → action rules, e.g. `p, editor, term:published, *, create|read|update|delete`). `server/utils/casbin.ts` loads the enforcer and exposes `createPermission`/`createPermissionKey`/`getRolePermissions` helpers that translate between casbin policy rows and the `action:resource:field` permission-key strings used across the app (session permissions, `usePermissions()` composable, route `meta.auth.permission` checks in `app/middleware/2.auth.global.ts`).

Both the Dockerfile build stage and the deploy stage copy `model.conf`/`policy.csv` alongside the built server output — if you touch permissions logic, keep that in mind for deployment.

### Auth (SAML)

Login is SAML-based via `@node-saml/node-saml`, wired through `nuxt-auth-utils` sessions. Relevant files: `server/routes/login/saml.post.ts`, `server/routes/saml/metadata.xml.get.ts`, `server/utils/saml.ts`, `app/saml/`. Local dev runs a `simplesamlphp` IdP container (`idp-saml-unbgeology-lib-unb-ca` in `docker-compose.yml`) alongside the app.

### API layer (server/api)

Nitro file-based routes under `server/api/`, one directory per resource (`specimens`, `terms`, `loans`, `affiliations`, `migrations`, `users`, `files`, ...), using the `index.get.ts` / `index.post.ts` / `[id].patch.ts` / `[id].delete.ts` naming convention. Query building/pagination/filtering helpers live in `server/utils/api/` (`query.ts`, `payload.ts`, `paginate.ts`) and `server/utils/paginate.ts`.

### Migrations (server/plugins/migrate, server/tasks/migrate)

A one-time-import subsystem for migrating legacy collection data (`server/plugins/migrate/{specimens,users,collectors,geochronology,compositions,storagelocation,...}.ts`), driven by Nitro tasks (`server/tasks/migrate/import.ts`, `rollback.ts`) and tracked via `Migration`/`MigrationItem` document types. This is scoped by its own casbin `migrator` role and `migrationitem` resource — don't confuse it with the general CRUD API.

### Frontend (app/)

Standard Nuxt 4 app directory: `pages/` (including a permission-gated `pages/dashboard/*` admin area), `components/` grouped by domain (`Entity`, `Form/*`, `Input/*`, `Leaflet`, `Term`, `User`, `Tw/*` for Tailwind-styled primitives), `composables/`, `middleware/2.auth.global.ts` for the global route guard described above, `layouts/`, `plugins/`. Styling is Tailwind (`tailwind.config.js`, `app/assets/css/main.css`); ESLint enforces backtick-string / 1tbs style via `@nuxt/eslint-config` with a Tailwind plugin overlay.

### Uploads

File uploads go through `h3-formidable`; storage location/behavior is controlled by `runtimeConfig.uploads` in `nuxt.config.ts` (differs between `$development` and production) and handled in `server/api/upload`, `server/routes/upload/[filename].get.ts`, `server/middleware/files/*.register.ts`, `server/utils/file.ts`.

## Environment

Runtime config comes from env vars prefixed `NUXT_...` (mapped in `nuxt.config.ts`'s `runtimeConfig`), loaded from `env/nuxt.env` for local dev (see `env/` directory for `saml.env`, `mongo.env`, etc.). Never commit real values into these files.
