import type { Session } from "h3"

export type UserSession = Session<Readonly<{
  id: string
  user: string
  profile?: {
    firstName: string
    lastName: string
  }
  authenticated: boolean
  permissions: string[]
  validUntil: number
}>>