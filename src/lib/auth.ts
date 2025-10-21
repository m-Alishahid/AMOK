import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// import { MongoDBAdapter } from "@auth/mongodb-adapter";
// import clientPromise from "./mongodb";

export const authOptions: NextAuthOptions = {
  // adapter: MongoDBAdapter(clientPromise), // Temporarily disabled
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // For demo, use hardcoded admin users. In production, query DB.
        const superAdminEmail = "nomanirshad0324@gmail.com";
        const superAdminPassword = "Noman@123";
        const accountAdminEmail = "alishahids519@gmail.com";
        const accountAdminPassword = "Ali@1234";

        if (credentials.email === superAdminEmail && credentials.password === superAdminPassword) {
          return { id: "1", email: superAdminEmail, name: "Super Admin" };
        } else if (credentials.email === accountAdminEmail && credentials.password === accountAdminPassword) {
          return { id: "2", email: accountAdminEmail, name: "Account Admin" };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id: string }).id = token.id as string;
      }
      return session;
    },
  },
};
