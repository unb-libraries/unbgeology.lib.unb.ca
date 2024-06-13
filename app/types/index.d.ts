import { File } from "@unb-libraries/nuxt-layer-entity"
import { H3Event } from "h3"

interface File {
  filename: string
  mimetype: string
}

declare module "nitropack" {
  interface NitroRuntimeConfig {
    defaultUser?: string | ((event: H3Event) => string | false)
    uploads: {
      dir: string | ((file: File) => string)
      uri: string | ((file: File) => string)
    }
  }
}

declare module "#app" {
  interface PageMeta {
    menu?: Partial<{
      id: string
      path: string
      hide: boolean
      name: string
      parent: string
      weight: number
    }>
    auth?: Partial<{
      permission: string | RegExp
      redirect: boolean
    }>
  }
}

export {}