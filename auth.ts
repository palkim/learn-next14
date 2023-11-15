import NextAuth from "next-auth"

import GitHub from "next-auth/providers/github"
import Keycloak from "next-auth/providers/keycloak"

import type { NextAuthConfig } from "next-auth"

export const config = {
  theme: {
    logo: "https://next-auth.js.org/img/logo/logo-sm.png",
  },
  providers: [
    GitHub,
    Keycloak
  ],
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl
      if (pathname === "/middleware-example") return !!auth
      return true
    },
  },
  
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
