'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AuthTestPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Note: register functionality removed for MVP simplicity
  
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    authError,
    login, 
    logout,
    refreshAuth 
  } = useAppStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Register functionality removed for MVP

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleRefreshAuth = async () => {
    try {
      await refreshAuth();
    } catch (error) {
      console.error('Auth refresh failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Authentication Test Page</h1>
          <p className="text-gray-600 mt-2">Test authentication functionality</p>
        </div>

        {/* Current Auth State */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current Authentication State</CardTitle>
            <CardDescription>View current user and auth status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Authentication Status</Label>
                <p className="text-lg font-medium">
                  {isAuthenticated ? (
                    <span className="text-green-600">✓ Authenticated</span>
                  ) : (
                    <span className="text-red-600">✗ Not Authenticated</span>
                  )}
                </p>
              </div>
              
              <div>
                <Label>Loading State</Label>
                <p>{isLoading ? 'Loading...' : 'Not Loading'}</p>
              </div>

              {authError && (
                <Alert variant="destructive">
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}

              {user && (
                <div>
                  <Label>User Information</Label>
                  <pre className="bg-gray-100 p-4 rounded mt-2 text-sm overflow-auto">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex gap-4">
                <Button onClick={handleRefreshAuth} disabled={isLoading}>
                  Refresh Auth State
                </Button>
                {isAuthenticated && (
                  <Button variant="destructive" onClick={handleLogout} disabled={isLoading}>
                    Logout
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Login Form */}
        {!isAuthenticated && (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Sign in to test authentication</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="test@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="password"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* API Test Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>API Testing Instructions</CardTitle>
            <CardDescription>How to test the authentication API endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Available Endpoints (MVP):</h4>
                <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                  <li><code>POST /api/auth/simple-login</code> - Admin login</li>
                  <li><code>POST /api/auth/logout</code> - Sign out</li>
                  <li><code>GET /api/auth/me</code> - Get current user</li>
                </ul>
                <p className="text-sm text-gray-600 mt-2">
                  Use admin credentials from .env.local: admin@example.com / admin123
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">Test with cURL:</h4>
                <pre className="bg-gray-100 p-4 rounded text-sm mt-2 overflow-auto">
{`# Admin Login
curl -X POST http://localhost:3000/api/auth/simple-login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@example.com","password":"admin123"}'

# Get current user
curl -X GET http://localhost:3000/api/auth/me \\
  -H "Content-Type: application/json"`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
