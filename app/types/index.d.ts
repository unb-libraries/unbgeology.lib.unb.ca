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