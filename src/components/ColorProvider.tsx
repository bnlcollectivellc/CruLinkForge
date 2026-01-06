'use client';

import { useEffect } from 'react';

export default function ColorProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Load saved color from localStorage and apply to CSS variable
    const savedColor = localStorage.getItem('forge_primary_color');
    if (savedColor) {
      document.documentElement.style.setProperty('--color-primary', savedColor);
    }
  }, []);

  return <>{children}</>;
}
