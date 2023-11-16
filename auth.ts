import NextAuth, { type DefaultSession, type NextAuthConfig} from "next-auth"

import Keycloak from "next-auth/providers/keycloak"

import { jwtDecode, JwtPayload } from 'jwt-decode'

import { JWT } from "@auth/core/jwt"

declare module "jwt-decode" {
  interface RealmAccess {
    roles: string[] | undefined
  }
  interface JWT {
    decoded: JwtPayload | undefined;
    userRole?: string[];
  }

  interface JwtPayload {
    realm_access: RealmAccess;
  }
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken: string;
    userRole: string[] | undefined;
  }
}

export const config = {
  // pages: {
  //   signIn: '/api/auth/singin'
  // },
  theme: {
    logo: "https://next-auth.js.org/img/logo/logo-sm.png",
  },
  providers: [
    Keycloak
  ],
  callbacks: {
    // We will use authorized callback after next-auth@5.beta solves the issues about middleware authentication
    // authorized({ request, auth }) {
    //   // console.log("request: ", request)
    //   // console.log("auth: ", auth)
    //   const { pathname, hostname } = request.nextUrl
    //   console.log(request.nextUrl)
    //   console.log("pathname: ", pathname)
    //   if (pathname === "/dashboard" ) {
    //   //   console.log("path is dashboard")
    //     console.log("hostname: ", hostname)
    //     return !!auth
    //   }
      
    //   return true
    // },
    async jwt({ token, account }) {
      if (account) {
        token.id_token = account?.id_token;
        token.expires_at = account?.expires_at;
        token.access_token = account?.access_token;
        token.refresh_token = account?.refresh_token;
        token.decoded = account.access_token ? jwtDecode<JwtPayload>(account.access_token) : undefined;
        token.userRole = account.access_token ? jwtDecode<JwtPayload>(account.access_token)?.realm_access?.roles : undefined;
      }

      return token;
    },
    async session({ session, token }) {
      if (token?.access_token) session.accessToken = token.access_token as string;
      if (token?.userRole) session.userRole = token?.userRole as string[];
      return session;
    }
  },
  events: {
    async signOut(message) {
      let token: JWT = message.token
      let signOutURL = new URL(`${process.env.AUTH_KEYCLOAK_ISSUER}/protocol/openid-connect/logout? 
                post_logout_redirect_uri=${encodeURIComponent(<string>process.env.NEXTAUTH_URL)}`)
      signOutURL.searchParams.set("id_token_hint", <string>token.id_token)
      await fetch(signOutURL)
    }
  }
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
