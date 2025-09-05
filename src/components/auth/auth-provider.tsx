'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/app';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth provider component that initializes authentication state on app load
 * This should be placed high in the component tree, typically in the root layout
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const refreshAuth = useAppStore((state) => state.refreshAuth);

  useEffect(() => {
    // Initialize authentication state when app loads
    refreshAuth();
  }, [refreshAuth]);

  return <>{children}</>;
}
