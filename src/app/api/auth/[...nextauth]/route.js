// app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
// import { authOptions } from '@/lib/auth-options';

const handler = NextAuth();

export { handler as GET, handler as POST };