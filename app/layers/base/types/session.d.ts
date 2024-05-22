import type { Session } from "h3"

export type UserSession = Session<Readonly<{
  user: string
  authenticated: boolean
  permissions: string[]
  validUntil: number
}>>