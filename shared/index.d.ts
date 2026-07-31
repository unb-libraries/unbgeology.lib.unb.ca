declare module '#auth-utils' {
  interface User {
    id: string
    username: string
    profile: {
      firstName: string
      lastName: string
    },
  }
  
  interface UserSession {
    user: User
    permissions: string[]
    validUntil?: number
  }
}

export {}
