import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only handle /api routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://165.227.182.17/api';
    const apiPath = request.nextUrl.pathname.replace('/api', '');
    const apiUrl = `${apiBase}${apiPath}`;

    // Clone the request headers
    const headers = new Headers(request.headers);
    
    // Forward the request to the actual API
    return NextResponse.rewrite(new URL(apiUrl), {
      headers: headers,
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};