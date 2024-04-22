import { readFile } from "fs/promises"
import { parseFile } from "@fast-csv/parse"
import { type Migration as MigrationEntity } from "@unb-libraries/nuxt-layer-entity"
import { type Migration as MigrationDoc } from "../../documentTypes/Migration"

export default defineEventHandler(async (event) => {
  const body = await readOneDocumentBodyOr400<MigrationDoc>(event, { model: Migration })
  const migration = await Migration.create(body)

  // const { source: sourceIDs } = migration
  // const { documents: sources } = await FileBase.find()
  //   .where(`_id`).in(sourceIDs)

  // const migration = await Migration.findByID(`${created._id}`)
  //   .join(`source`, FileBase, { cardinality: `many` })
  //   .join(`dependencies`, Migration, { cardinality: `many` })
  //   .select(`source.filepath`, `source.mimetype`)

  return await renderDocument<MigrationEntity, MigrationDoc>(migration, {
    model: Migration,
    self: migration => `/api/migrations/${migration._id}`,
  })

  // sources.forEach(async (source) => {
  //   switch (source.mimetype) {
  //     case `application/json`: {
  //       const json = await readFile(source.filepath, { encoding: `utf8` })
  //       const items = JSON.parse(json)
  //       useNitroApp().hooks.callHook(`migrate:init`, rendered.self, items)
  //     }; break

  //     case `application/csv`:{
  //       const items: any[] = []
  //       let header: string[] = []
  //       parseFile(source.filepath)
  //         .on(`data`, (row: string[]) => {
  //           if (header.length === 0) {
  //             header = row.map(col => col.toLowerCase())
  //           } else {
  //             const item = Object.fromEntries(row.map((col, index) => [header[index], col]))
  //             items.push(item)
  //           }
  //         })
  //         .on(`end`, (count: number) => {
  //           useNitroApp().hooks.callHook(`migrate:init`, rendered.self, items)
  //         })
  //     }; break
  //     default:
  //   }
  // })

  // return rendered
})
