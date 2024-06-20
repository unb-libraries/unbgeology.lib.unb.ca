import { access, constants } from "fs/promises"
import { consola } from "consola"
import { FileState } from "~/layers/entity/src/types"

const fileExists = async (filepath: string) => {
  try {
    await access(filepath, constants.R_OK)
    return true
  } catch (err: unknown) {
    return false
  }
}

function loadPaginated() {
  let skip = 0; const limit = 2
  async function* doLoad() {
    let files = await FileBase.mongoose.model.find().skip(skip).limit(limit)
    while (files.length > 0) {
      yield files
      skip += limit
      files = await FileBase.mongoose.model.find().skip(skip).limit(limit)
    }
  }
  return doLoad()
}

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook(`mongoose:init`, async () => {
    for await (const files of loadPaginated()) {
      const orphans = (await Promise.all(files
        .map<Promise<[typeof files[number], boolean]>>(async file => [file, await fileExists(file.filepath)])))
        .filter(([, exists]) => !exists)

      const total = orphans.length
      if (total > 0) {
        await Promise.all(orphans.map(([file]) => file.updateOne({ status: FileState.DELETED })))
      }
    }

    const { deletedCount } = await FileBase.mongoose.model.deleteMany({ status: FileState.DELETED })
    if (deletedCount > 0) {
      consola.log(`Pruned ${deletedCount} file document(s)`)
    } else {
      consola.log(`No orphaned file documents found`)
    }
  })
})
