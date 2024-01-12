import { type H3Event } from "h3"

export async function migrationBodyReader(body: any, event: H3Event) {
  const { source: fileURIs, dependencies: migrationURIs, ...migrationBody } = body

  if (fileURIs) {
    const sources = await FileBase.findManyByURI(fileURIs)
    if (Array.isArray(sources)) {
      migrationBody.source = sources
    }
  }

  if (Array.isArray(migrationURIs)) {
    const dependencies = await Migration.findManyByURI(migrationURIs)
    if (dependencies.length > 0) {
      migrationBody.dependencies = dependencies
    }
  }

  return migrationBody
}
