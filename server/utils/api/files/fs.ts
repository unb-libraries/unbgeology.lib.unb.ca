import { access, readFile, rm as deleteFile, writeFile } from "fs/promises"
import { FileState } from "@unb-libraries/nuxt-layer-entity"

export async function fileExists(filepath: string) {
  try {
    await access(filepath)
    return true
  } catch {
    return false
  }
}

export function getUploadDir(status: FileState) {
  if (!status || status === FileState.PENDING) {
    return `/tmp`
  } else {
    const { dir } = useRuntimeConfig()?.uploads as { dir: string }
    return dir.replace(/\/+$/, ``)
  }
}

type MoveFileOptions = { force: boolean}
export async function moveFile(origin: string, destination: string, options?: Partial<MoveFileOptions>): Promise<void> {
  const exists = await fileExists(destination)
  if (!exists || options?.force) {
    const fileContent = await readFile(origin)
    await writeFile(destination, fileContent)
    await deleteFile(origin)
  } else {
    throw new Error(`File already exists at ${destination}`)
  }
}

export async function removeFile(filepath: string) {
  await deleteFile(filepath, { force: true })
}
