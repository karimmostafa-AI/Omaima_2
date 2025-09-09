'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { useAppStore } from '@/store/app';
import { Loader2 } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const { user, isLoading } = useAppStore();

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      // Redirect authenticated users to appropriate dashboard
      const dashboardPath = user.role === 'ADMIN' ? '/admin' : '/dashboard';
      router.push(dashboardPath);
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'Loading...' : 'Redirecting...'}
          </p>
        </div>
      </div>
    );
  }

  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}