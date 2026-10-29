import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/mongodb-client"

const hasMongo = Boolean(process.env.MONGODB_URI)

// Without these Google rejects sign-in with "Missing required parameter: client_id"
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('[auth] GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set in .env — Google sign-in will fail.')
}

async function refreshAccessToken(token: Record<string, unknown>) {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string,
      }),
      method: 'POST',
    })

    const refreshedTokens = await response.json()
    if (!response.ok) throw refreshedTokens

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + (refreshedTokens.expires_in ?? 3600) * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    }
  } catch (error) {
    console.error('Error refreshing Google access token:', error)
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    }
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...(hasMongo ? { adapter: MongoDBAdapter(clientPromise) } : {}),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/youtube.force-ssl',
            'https://www.googleapis.com/auth/youtube',
          ].join(' '),
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : undefined
        token.googleId = account.providerAccountId
      }
      if (user) {
        token.userId = user.id
      }

      if (!token.accessTokenExpires || Date.now() < (token.accessTokenExpires as number)) {
        return token
      }

      if (token.refreshToken) {
        return refreshAccessToken(token)
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = (token.userId as string) ?? (token.sub as string)
        session.user.googleId = token.googleId as string
        session.accessToken = token.accessToken as string
        session.error = token.error as string | undefined
      }
      return session
    },
    async signIn({ account, profile }) {
      if (account?.provider === 'google' && profile) {
        return true
      }
      return false
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
})
