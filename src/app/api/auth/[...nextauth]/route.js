// NextAuth is not being used in this application
// Custom JWT authentication is implemented instead
// This route can be removed or commented out

// import NextAuth from 'next-auth';
// import { authOptions } from '@/lib/auth-options';

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };

export async function GET() {
  return new Response(JSON.stringify({ message: 'NextAuth not configured' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST() {
  return new Response(JSON.stringify({ message: 'NextAuth not configured' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
