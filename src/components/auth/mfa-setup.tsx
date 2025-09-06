'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/auth-store';
import { 
  Shield, 
  Smartphone, 
  Key, 
  Copy, 
  CheckCircle, 
  AlertTriangle,
  QrCode,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MFASetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function MFASetup({ onComplete, onCancel, className }: MFASetupProps) {
  const { enableMFA, verifyMFA, loading } = useAuthStore();
  const [step, setStep] = useState<'intro' | 'setup' | 'verify' | 'backup' | 'complete'>('intro');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  const handleStartSetup = async () => {
    setError(null);
    try {
      const result = await enableMFA();
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      setQrCode(result.qrCode);
      setSecret(result.secret);
      setBackupCodes(result.backupCodes);
      setStep('setup');
    } catch (error) {
      setError('Failed to initialize MFA setup');
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setError(null);
    try {
      const result = await verifyMFA(verificationCode);
      
      if (!result.success) {
        setError(result.error || 'Invalid verification code');
        return;
      }
      
      setStep('backup');
    } catch (error) {
      setError('Failed to verify code');
    }
  };

  const handleCopy = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set([...prev, itemId]));
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleComplete = () => {
    setStep('complete');
    setTimeout(() => {
      onComplete?.();
    }, 2000);
  };

  const formatSecret = (secret: string) => {
    // Format secret in groups of 4 for readability
    return secret.match(/.{1,4}/g)?.join(' ') || secret;
  };

  const downloadBackupCodes = () => {
    const content = `Omaima MFA Backup Codes\nGenerated: ${new Date().toLocaleString()}\n\n${backupCodes.join('\n')}\n\nKeep these codes safe! Each can only be used once.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'omaima-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={cn('w-full max-w-2xl mx-auto', className)}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-fit">
          <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <CardTitle className="text-2xl">Multi-Factor Authentication</CardTitle>
        <CardDescription>
          Secure your account with an additional layer of protection
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'intro' && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">Why enable MFA?</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center space-y-2">
                  <Shield className="h-12 w-12 mx-auto text-green-600" />
                  <h4 className="font-medium">Enhanced Security</h4>
                  <p className="text-sm text-muted-foreground">
                    Protect your account even if your password is compromised
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <Smartphone className="h-12 w-12 mx-auto text-blue-600" />
                  <h4 className="font-medium">Easy to Use</h4>
                  <p className="text-sm text-muted-foreground">
                    Use any authenticator app on your phone
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <Key className="h-12 w-12 mx-auto text-purple-600" />
                  <h4 className="font-medium">Backup Codes</h4>
                  <p className="text-sm text-muted-foreground">
                    Get backup codes for account recovery
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h4 className="font-medium mb-2">You'll need:</h4>
              <ul className="space-y-1 text-sm">
                <li>• An authenticator app (Google Authenticator, Authy, etc.)</li>
                <li>• Your mobile device to scan a QR code</li>
                <li>• A safe place to store backup codes</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleStartSetup} disabled={loading} className="flex-1">
                {loading ? 'Setting up...' : 'Start Setup'}
              </Button>
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}

        {step === 'setup' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Scan QR Code</h3>
              <p className="text-muted-foreground">
                Use your authenticator app to scan this QR code
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <QrCode className="h-32 w-32 text-gray-400" />
                <p className="text-xs text-center mt-2 text-gray-500">QR Code Placeholder</p>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Can't scan? Enter this code manually:
                </p>
                <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded border">
                  <code className="text-sm font-mono flex-1">
                    {formatSecret(secret)}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(secret, 'secret')}
                  >
                    {copiedItems.has('secret') ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <Button onClick={() => setStep('verify')} className="w-full">
              I've Added the Account
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Verify Setup</h3>
              <p className="text-muted-foreground">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  id="verification-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-widest"
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleVerifyCode} 
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </Button>
                <Button variant="outline" onClick={() => setStep('setup')}>
                  Back
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'backup' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Save Backup Codes</h3>
              <p className="text-muted-foreground">
                Store these codes safely. Each can only be used once.
              </p>
            </div>

            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Save these backup codes in a secure location. 
                You can use them to access your account if you lose your device.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Backup Codes</h4>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(backupCodes.join('\n'), 'backup-codes')}
                  >
                    {copiedItems.has('backup-codes') ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    Copy All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={downloadBackupCodes}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 dark:bg-gray-900 rounded border">
                {backupCodes.map((code, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <code className="text-sm font-mono flex-1 p-1 bg-white dark:bg-gray-800 rounded">
                      {code}
                    </code>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleComplete} className="flex-1">
                I've Saved My Codes
              </Button>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center space-y-6">
            <div className="mx-auto p-3 bg-green-100 dark:bg-green-900 rounded-full w-fit">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                MFA Successfully Enabled!
              </h3>
              <p className="text-muted-foreground">
                Your account is now protected with multi-factor authentication
              </p>
            </div>

            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <Shield className="h-3 w-3 mr-1" />
              Account Secured
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}