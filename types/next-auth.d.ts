import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    error?: string
    user: {
      id: string
      googleId?: string
    } & DefaultSession['user']
  }

  interface User {
    googleId?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string
    googleId?: string
    accessToken?: string
    refreshToken?: string
    accessTokenExpires?: number
    error?: string
  }
}

