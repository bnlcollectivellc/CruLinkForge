import { headers } from 'next/headers';
import prisma from '@/lib/db';
import type { TenantConfig } from '@/types';

/**
 * Get tenant slug from the current request
 * Checks: x-tenant-slug header (set by middleware), or query param, or default
 */
export async function getTenantSlug(): Promise<string | null> {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug');
  return tenantSlug;
}

/**
 * Get full tenant config by slug
 */
export async function getTenantBySlug(slug: string): Promise<TenantConfig | null> {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
        logoUrl: true,
        taxRate: true,
        taxLabel: true,
        currency: true,
        status: true,
      },
    });

    if (!tenant || tenant.status !== 'ACTIVE') {
      return null;
    }

    return {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      branding: {
        primaryColor: tenant.primaryColor,
        secondaryColor: tenant.secondaryColor,
        accentColor: tenant.accentColor || undefined,
        logoUrl: tenant.logoUrl || undefined,
      },
      taxRate: tenant.taxRate,
      taxLabel: tenant.taxLabel || 'Sales Tax',
      currency: tenant.currency,
    };
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return null;
  }
}

/**
 * Get tenant by subdomain or custom domain
 */
export async function getTenantByDomain(domain: string): Promise<TenantConfig | null> {
  try {
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { subdomain: domain },
          { customDomain: domain },
        ],
        status: 'ACTIVE',
      },
      select: {
        id: true,
        slug: true,
        name: true,
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
        logoUrl: true,
        taxRate: true,
        taxLabel: true,
        currency: true,
      },
    });

    if (!tenant) {
      return null;
    }

    return {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      branding: {
        primaryColor: tenant.primaryColor,
        secondaryColor: tenant.secondaryColor,
        accentColor: tenant.accentColor || undefined,
        logoUrl: tenant.logoUrl || undefined,
      },
      taxRate: tenant.taxRate,
      taxLabel: tenant.taxLabel || 'Sales Tax',
      currency: tenant.currency,
    };
  } catch (error) {
    console.error('Error fetching tenant by domain:', error);
    return null;
  }
}

/**
 * Extract subdomain from hostname
 */
export function extractSubdomain(hostname: string): string | null {
  // Handle localhost
  if (hostname.includes('localhost')) {
    return null;
  }

  const parts = hostname.split('.');

  // Need at least 3 parts for subdomain (sub.domain.tld)
  if (parts.length < 3) {
    return null;
  }

  // First part is the subdomain
  const subdomain = parts[0];

  // Ignore common non-tenant subdomains
  const ignoredSubdomains = ['www', 'app', 'api', 'admin', 'embed'];
  if (ignoredSubdomains.includes(subdomain)) {
    return null;
  }

  return subdomain;
}

/**
 * Generate a URL-safe slug from a string
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
