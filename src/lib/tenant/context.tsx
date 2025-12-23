'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { TenantConfig } from '@/types';

interface TenantContextValue {
  tenant: TenantConfig | null;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  isLoading: true,
});

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

interface TenantProviderProps {
  tenant: TenantConfig | null;
  children: ReactNode;
}

export function TenantProvider({ tenant, children }: TenantProviderProps) {
  return (
    <TenantContext.Provider value={{ tenant, isLoading: false }}>
      {/* Inject tenant theme CSS variables */}
      {tenant && (
        <style jsx global>{`
          :root {
            --tenant-primary: ${tenant.branding.primaryColor};
            --tenant-primary-hover: ${adjustBrightness(tenant.branding.primaryColor, -15)};
            --tenant-secondary: ${tenant.branding.secondaryColor};
            --tenant-accent: ${tenant.branding.accentColor || tenant.branding.primaryColor};
          }
        `}</style>
      )}
      {children}
    </TenantContext.Provider>
  );
}

// Helper to adjust color brightness
function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

export { TenantContext };
