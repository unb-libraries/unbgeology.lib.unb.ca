declare module "#app" {
  interface PageMeta {
    auth?: Partial<{
      permission: string | RegExp
      redirect: boolean
    }>
  }
}

export {}