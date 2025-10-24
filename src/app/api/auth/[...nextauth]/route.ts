import type { NextRequest } from 'next/server'

// Minimal placeholder route for [...nextauth] to avoid build-time import errors.
// If you want full NextAuth support, replace this with NextAuth(authOptions)
// and ensure `src/lib/auth.ts` exports a valid `authOptions` object.

export async function GET(req: NextRequest) {
	return new Response('Not Implemented', { status: 501 })
}

export async function POST(req: NextRequest) {
	return new Response('Not Implemented', { status: 501 })
}
