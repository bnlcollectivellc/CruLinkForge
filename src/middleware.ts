import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Multi-tenant middleware
 *
 * Resolves tenant from:
 * 1. Subdomain (forge.browningwelding.com -> browningwelding)
 * 2. Path parameter (/tenant/browningwelding)
 * 3. Query parameter (?tenant=browningwelding)
 *
 * Injects tenant info into request headers for server components
 */
export function middleware(request: NextRequest) {
  const { hostname, pathname, searchParams } = request.nextUrl;
  const response = NextResponse.next();

  // Skip static files and API routes that don't need tenant context
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.') // static files
  ) {
    return response;
  }

  let tenantSlug: string | null = null;

  // 1. Check subdomain
  const subdomain = extractSubdomain(hostname);
  if (subdomain) {
    tenantSlug = subdomain;
  }

  // 2. Check path parameter (for /tenant/[slug] routes)
  const pathMatch = pathname.match(/^\/tenant\/([^\/]+)/);
  if (pathMatch) {
    tenantSlug = pathMatch[1];
  }

  // 3. Check query parameter (for development/testing)
  const queryTenant = searchParams.get('tenant');
  if (queryTenant) {
    tenantSlug = queryTenant;
  }

  // 4. Check for embed route
  const embedMatch = pathname.match(/^\/embed\/([^\/]+)/);
  if (embedMatch) {
    tenantSlug = embedMatch[1];
  }

  // Inject tenant slug into headers for server components
  if (tenantSlug) {
    response.headers.set('x-tenant-slug', tenantSlug);
  }

  return response;
}

/**
 * Extract subdomain from hostname
 */
function extractSubdomain(hostname: string): string | null {
  // Handle localhost with port
  if (hostname.includes('localhost')) {
    return null;
  }

  const parts = hostname.split('.');

  // Need at least 3 parts for subdomain (sub.domain.tld)
  if (parts.length < 3) {
    return null;
  }

  const subdomain = parts[0];

  // Ignore common non-tenant subdomains
  const ignoredSubdomains = ['www', 'app', 'api', 'admin'];
  if (ignoredSubdomains.includes(subdomain)) {
    return null;
  }

  return subdomain;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
