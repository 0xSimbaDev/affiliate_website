import { DefaultSession, DefaultUser } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'ADMIN' | 'OWNER'
      sites: Array<{ id: string; slug: string; name: string }>
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: 'ADMIN' | 'OWNER'
    sites: Array<{ id: string; slug: string; name: string }>
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'ADMIN' | 'OWNER'
    sites: Array<{ id: string; slug: string; name: string }>
  }
}
