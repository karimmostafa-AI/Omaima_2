'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { useAuthStore } from '@/store/auth-store';
import { Loader2 } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  useEffect(() => {
    if (loading) return;

    if (user) {
      // Redirect authenticated users to dashboard
      const dashboardPath = user.role === 'ADMIN' ? '/admin' : '/dashboard';
      router.push(dashboardPath);
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading...' : 'Redirecting...'}
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