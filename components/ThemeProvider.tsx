'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useStore((state) => state.theme);

  useEffect(() => {
    // Apply theme class to body
    document.body.className = theme;
  }, [theme]);

  return <>{children}</>;
}



