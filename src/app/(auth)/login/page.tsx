'use client';

import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { withGuestOnly } from '@/components/auth/auth-wrapper';
import { Loader2 } from 'lucide-react';

function LoginPageContent() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

// Wrap with guest-only HOC to redirect authenticated users
export default withGuestOnly(LoginPageContent);
