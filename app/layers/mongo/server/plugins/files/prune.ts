import { readFile } from "fs/promises"
import { consola } from "consola"

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook(`mongoose:init`, async () => {
    consola.log(`Pruning orphaned file documents...`)
    const { documents: files } = await FileBase.find()

    const fileExists = async (filepath: string) => {
      try {
        await readFile(filepath)
        return true
      } catch (err: unknown) {
        return false
      }
    }

    const orphans = await Promise.all(files.filter(file => !fileExists(file.filepath)))
    if (orphans.length > 0) {
      consola.log(`${orphans.length} file documents have been orphaned.`)
      orphans.forEach(file => consola.log(file.filepath))
    } else {
      consola.log(`No orphaned file documents found.`)
    }

    const { documents, total } = await FileBase.delete()
      .where(`_id`).in(orphans.map(file => file._id))

    if (total > 0) {
      consola.log(`Pruned ${total} file document(s):`)
      documents.forEach(file => consola.log(`${file._id}`))
    }
  })
})
