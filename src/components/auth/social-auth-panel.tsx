'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  GoogleLoginButton, 
  FacebookLoginButton, 
  GitHubLoginButton, 
  AppleLoginButton 
} from './social-login-button';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialAuthPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onError'> {
  title?: string;
  description?: string;
  providers?: ('google' | 'facebook' | 'github' | 'apple')[];
  variant?: 'default' | 'compact' | 'grid';
  showDivider?: boolean;
  dividerText?: string;
  onSuccess?: (provider: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function SocialAuthPanel({
  title = "Continue with Social",
  description = "Choose your preferred sign-in method",
  providers = ['google', 'facebook', 'github', 'apple'],
  variant = 'default',
  showDivider = true,
  dividerText = "OR",
  onSuccess,
  onError,
  className,
  ...rest
}: SocialAuthPanelProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSuccess = (provider: string) => {
    setError(null);
    setSuccess(`Successfully signed in with ${provider}`);
    onSuccess?.(provider);
  };

  const handleError = (errorMessage: string) => {
    setSuccess(null);
    setError(errorMessage);
    onError?.(errorMessage);
  };

  const renderProvider = (provider: 'google' | 'facebook' | 'github' | 'apple') => {
    const commonProps = {
      onSuccess: () => handleSuccess(provider),
      onError: handleError,
      className: variant === 'compact' ? 'w-full' : undefined
    };

    switch (provider) {
      case 'google':
        return <GoogleLoginButton key={provider} {...commonProps} />;
      case 'facebook':
        return <FacebookLoginButton key={provider} {...commonProps} />;
      case 'github':
        return <GitHubLoginButton key={provider} {...commonProps} />;
      case 'apple':
        return <AppleLoginButton key={provider} {...commonProps} />;
    }
  };

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-3', className)} {...rest}>
        {showDivider && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">{dividerText}</span>
            </div>
          </div>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          {providers.map(renderProvider)}
        </div>
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <Card className={className} {...rest}>
        <CardHeader className="text-center">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-3">
            {providers.map(renderProvider)}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={className} {...rest}>
      <CardHeader className="text-center">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {providers.map(renderProvider)}
        </div>
        
        {showDivider && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">{dividerText}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Specialized components for different contexts
export function LoginSocialPanel(props: Omit<SocialAuthPanelProps, 'title' | 'description'>) {
  return (
    <SocialAuthPanel
      title="Sign in to your account"
      description="Choose your preferred sign-in method"
      {...props}
    />
  );
}

export function RegisterSocialPanel(props: Omit<SocialAuthPanelProps, 'title' | 'description'>) {
  return (
    <SocialAuthPanel
      title="Create your account"
      description="Get started with one of these services"
      {...props}
    />
  );
}

export function QuickSocialLogin(props: Omit<SocialAuthPanelProps, 'variant' | 'showDivider'>) {
  return (
    <SocialAuthPanel
      variant="compact"
      showDivider={false}
      {...props}
    />
  );
}