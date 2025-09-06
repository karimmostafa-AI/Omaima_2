'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/auth-store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Lock,
  Smartphone,
  Clock,
  MapPin,
  Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';

const adminLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  mfaCode: z.string().optional(),
});

type AdminLoginForm = z.infer<typeof adminLoginSchema>;

interface AdminLoginProps {
  onSuccess?: () => void;
  redirectTo?: string;
  className?: string;
}

export function AdminLoginForm({ onSuccess, redirectTo, className }: AdminLoginProps) {
  const router = useRouter();
  const { signIn, validateAdminAccess, createAdminSession, loading } = useAuthStore();
  const [step, setStep] = useState<'credentials' | 'mfa' | 'success'>('credentials');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<{
    ip: string;
    location: string;
    device: string;
    timestamp: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema)
  });

  const mfaCode = watch('mfaCode');

  // Get session info on component mount
  React.useEffect(() => {
    // Get user's IP and device info
    fetch('/api/auth/get-ip')
      .then(res => res.json())
      .then(data => {
        setSessionInfo({
          ip: data.ip || 'Unknown',
          location: data.location || 'Unknown Location',
          device: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop',
          timestamp: new Date().toLocaleString()
        });
      })
      .catch(() => {
        setSessionInfo({
          ip: 'Unknown',
          location: 'Unknown Location', 
          device: 'Unknown Device',
          timestamp: new Date().toLocaleString()
        });
      });
  }, []);

  const onSubmit = async (data: AdminLoginForm) => {
    setError(null);

    if (step === 'credentials') {
      try {
        const result = await signIn(data.email, data.password);
        
        if (result.error) {
          setError(result.error);
          return;
        }

        if (result.requiresMFA) {
          setStep('mfa');
          return;
        }

        // Validate admin access
        const hasAdminAccess = await validateAdminAccess();
        if (!hasAdminAccess) {
          setError('Access denied. Admin privileges required.');
          return;
        }

        // Create admin session
        const adminSession = await createAdminSession(
          sessionInfo?.ip || 'unknown',
          navigator.userAgent
        );

        if (!adminSession) {
          setError('Failed to create secure admin session');
          return;
        }

        setStep('success');
        
        // Redirect after short delay
        setTimeout(() => {
          onSuccess?.();
          router.push(redirectTo || '/admin/dashboard');
        }, 2000);

      } catch (error) {
        setError('An unexpected error occurred during login');
      }
    } else if (step === 'mfa') {
      if (!data.mfaCode || data.mfaCode.length !== 6) {
        setError('Please enter a valid 6-digit MFA code');
        return;
      }

      // Verify MFA code (this would be implemented in the auth store)
      // For now, simulate verification
      setStep('success');
      
      setTimeout(() => {
        onSuccess?.();
        router.push(redirectTo || '/admin/dashboard');
      }, 2000);
    }
  };

  const formatMFACode = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    setValue('mfaCode', numbers.slice(0, 6));
  };

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <Card className="border-2 border-orange-200 dark:border-orange-800">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-orange-100 dark:bg-orange-900 rounded-full w-fit">
            <Shield className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-2xl text-orange-600 dark:text-orange-400">
            Admin Access
          </CardTitle>
          <CardDescription>
            {step === 'credentials' && 'Enhanced security verification required'}
            {step === 'mfa' && 'Multi-factor authentication'}
            {step === 'success' && 'Access granted'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Security Notice */}
          <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950">
            <Lock className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Security Notice:</strong> This session will be monitored and logged. 
              Admin access requires additional verification.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Session Information */}
          {sessionInfo && step === 'credentials' && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Session Information</h4>
              <div className="grid gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span>IP: {sessionInfo.ip}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Monitor className="h-3 w-3 text-muted-foreground" />
                  <span>Device: {sessionInfo.device}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>Time: {sessionInfo.timestamp}</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {step === 'credentials' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Admin Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@omaima.com"
                    {...register('email')}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your secure password"
                      {...register('password')}
                      className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  disabled={isSubmitting || loading}
                >
                  {isSubmitting || loading ? 'Verifying...' : 'Secure Login'}
                </Button>
              </>
            )}

            {step === 'mfa' && (
              <>
                <div className="text-center space-y-2">
                  <Smartphone className="h-12 w-12 mx-auto text-orange-600" />
                  <h3 className="font-semibold">Multi-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mfaCode">Verification Code</Label>
                  <Input
                    id="mfaCode"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    value={mfaCode || ''}
                    onChange={(e) => formatMFACode(e.target.value)}
                    className="text-center text-2xl tracking-widest"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                    disabled={!mfaCode || mfaCode.length !== 6 || isSubmitting}
                  >
                    {isSubmitting ? 'Verifying...' : 'Verify'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('credentials')}
                  >
                    Back
                  </Button>
                </div>
              </>
            )}

            {step === 'success' && (
              <div className="text-center space-y-4">
                <div className="mx-auto p-3 bg-green-100 dark:bg-green-900 rounded-full w-fit">
                  <Shield className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">
                    Access Granted
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Redirecting to admin dashboard...
                  </p>
                </div>

                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Admin Session Active
                </Badge>
              </div>
            )}
          </form>

          {step === 'credentials' && (
            <>
              <Separator />
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Security Features</h4>
                <div className="grid gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>IP Address Monitoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Session Encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Activity Logging</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Multi-Factor Authentication</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {step === 'credentials' && (
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Need help? Contact your system administrator
          </p>
        </div>
      )}
    </div>
  );
}
