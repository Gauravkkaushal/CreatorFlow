import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/mongodb-client"

const isDemoMode = process.env.DEMO_MODE === 'true'
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.npm_lifecycle_event === 'build'

// Validate required environment variables at runtime (non-demo mode only, outside static build analysis)
if (!isDemoMode && !isBuildPhase) {
  const required = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXTAUTH_SECRET',
  ] as const

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(
        `Missing required environment variable: ${key}. ` +
        'Set it in .env.local or set DEMO_MODE=true to run without real credentials.'
      )
    }
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...(isDemoMode ? {} : { adapter: MongoDBAdapter(clientPromise) }),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
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
    strategy: isDemoMode ? 'jwt' : 'database',
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
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string ?? token.sub as string
        session.user.googleId = token.googleId as string
        // NOTE: never expose raw tokens to client; they stay server-side only
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
