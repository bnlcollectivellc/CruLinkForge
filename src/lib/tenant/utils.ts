import { headers } from 'next/headers';
import { supabase } from '@/lib/db';
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
    const { data: org, error } = await supabase
      .from('organizations')
      .select('id, slug, name, primary_color, logo_url, settings')
      .eq('slug', slug)
      .single();

    if (error || !org) {
      return null;
    }

    return {
      id: org.id,
      slug: org.slug,
      name: org.name,
      branding: {
        primaryColor: org.primary_color || '#dc2626',
        secondaryColor: '#1f2937',
        accentColor: undefined,
        logoUrl: org.logo_url || undefined,
      },
      taxRate: 0.0975, // Default tax rate
      taxLabel: 'Sales Tax',
      currency: 'USD',
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
    // For now, try to match by slug since we don't have subdomain/customDomain columns
    const { data: org, error } = await supabase
      .from('organizations')
      .select('id, slug, name, primary_color, logo_url, settings')
      .eq('slug', domain)
      .single();

    if (error || !org) {
      return null;
    }

    return {
      id: org.id,
      slug: org.slug,
      name: org.name,
      branding: {
        primaryColor: org.primary_color || '#dc2626',
        secondaryColor: '#1f2937',
        accentColor: undefined,
        logoUrl: org.logo_url || undefined,
      },
      taxRate: 0.0975,
      taxLabel: 'Sales Tax',
      currency: 'USD',
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
