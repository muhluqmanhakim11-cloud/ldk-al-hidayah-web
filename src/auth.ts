import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        const userResult = await db.select().from(users).where(eq(users.email, credentials.email as string));
        const user = userResult[0];

        if (!user) return null;

        const isPasswordValid = await compare(credentials.password as string, user.passwordHash);
        
        if (!isPasswordValid) return null;

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          divisionId: user.divisionId
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        token.realRole = u.role;
        
        // Map to legacy roles to maintain zero-touch on existing modules
        if (u.role === 'super_admin') {
          token.role = 'SUPER_ADMIN';
        } else if (u.role && u.role.startsWith('admin_')) {
          token.role = 'ADMIN_BIDANG';
        } else {
          token.role = u.role;
        }
        
        token.divisionId = u.divisionId;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role; // Legacy mapped role for old modules
        (session.user as any).realRole = token.realRole; // Exact new role for new modules
        (session.user as any).divisionId = token.divisionId;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});
